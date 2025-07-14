
import AVFoundation

class AudioCapture {
    let engine = AVAudioEngine()
    let outputFile = FileHandle.standardOutput
    var bytesWritten: UInt32 = 0

    func startRecording() throws {
        let inputNode = engine.inputNode
        let format = inputNode.outputFormat(forBus: 0)

        let sampleRate = Int(format.sampleRate)
        let channels = Int(format.channelCount)
        let bitsPerSample = 16  // We’ll assume 16-bit PCM
        let byteRate = sampleRate * channels * bitsPerSample / 8
        let blockAlign = channels * bitsPerSample / 8

        // Write placeholder WAV header (we'll fix the sizes later)
        var header = Data()

        func writeUInt32LE(_ value: UInt32) -> Data {
            var val = value.littleEndian
            return Data(bytes: &val, count: 4)
        }

        func writeUInt16LE(_ value: UInt16) -> Data {
            var val = value.littleEndian
            return Data(bytes: &val, count: 2)
        }

        // RIFF chunk descriptor
        header.append("RIFF".data(using: .ascii)!)
        header.append(writeUInt32LE(0))  // Placeholder for file size
        header.append("WAVE".data(using: .ascii)!)

        // fmt subchunk
        header.append("fmt ".data(using: .ascii)!)
        header.append(writeUInt32LE(16))  // Subchunk1Size for PCM
        header.append(writeUInt16LE(1))   // AudioFormat PCM
        header.append(writeUInt16LE(UInt16(channels)))
        header.append(writeUInt32LE(UInt32(sampleRate)))
        header.append(writeUInt32LE(UInt32(byteRate)))
        header.append(writeUInt16LE(UInt16(blockAlign)))
        header.append(writeUInt16LE(UInt16(bitsPerSample)))

        // data subchunk
        header.append("data".data(using: .ascii)!)
        header.append(writeUInt32LE(0))  // Placeholder for data size

        outputFile.write(header)

        inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { (buffer, time) in
            let audioBuffer = buffer.audioBufferList.pointee.mBuffers
            if let data = audioBuffer.mData {
                let chunk = Data(bytes: data, count: Int(audioBuffer.mDataByteSize))
                self.outputFile.write(chunk)
                self.bytesWritten += UInt32(audioBuffer.mDataByteSize)
            }
        }

        try engine.start()
    }

    func stopRecording() {
    engine.stop()
    engine.inputNode.removeTap(onBus: 0)

    let fileSize = bytesWritten + 44 - 8
    let dataSize = bytesWritten

    if #available(macOS 10.15, *) {
        do {
            try outputFile.seek(toOffset: 4)
            outputFile.write(Data([
                UInt8(truncatingIfNeeded: fileSize & 0xff),
                UInt8(truncatingIfNeeded: (fileSize >> 8) & 0xff),
                UInt8(truncatingIfNeeded: (fileSize >> 16) & 0xff),
                UInt8(truncatingIfNeeded: (fileSize >> 24) & 0xff)
            ]))

            try outputFile.seek(toOffset: 40)
            outputFile.write(Data([
                UInt8(truncatingIfNeeded: dataSize & 0xff),
                UInt8(truncatingIfNeeded: (dataSize >> 8) & 0xff),
                UInt8(truncatingIfNeeded: (dataSize >> 16) & 0xff),
                UInt8(truncatingIfNeeded: (dataSize >> 24) & 0xff)
            ]))
        } catch {
            print("Failed to finalize WAV header:", error)
        }
    } else {
        print("⚠️ Cannot finalize WAV header: macOS < 10.15 does not support seek().")
    }

    outputFile.closeFile()
}


}
