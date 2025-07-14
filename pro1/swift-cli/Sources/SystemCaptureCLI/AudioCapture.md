import AVFoundation

class AudioCapture {
  static let shared = AudioCapture()
  private var engine: AVAudioEngine!
  private var converter: AVAudioConverter!

  func start(format: Format) throws {
    engine = AVAudioEngine()
    let inputNode = engine.inputNode
    let inputFormat = inputNode.outputFormat(forBus: 0)
    let outputFormat = AVAudioFormat(commonFormat: .pcmFormatInt16, sampleRate: inputFormat.sampleRate, channels: 2, interleaved: false)!
    let aacFormat = AVAudioFormat(settings: [
      AVFormatIDKey: kAudioFormatMPEG4AAC,
      AVSampleRateKey: inputFormat.sampleRate,
      AVNumberOfChannelsKey: 2
    ])!

    converter = AVAudioConverter(from: inputFormat, to: aacFormat)

    inputNode.installTap(onBus: 0, bufferSize: 1024, format: inputFormat) { buffer, _ in
      let outBuffer = AVAudioCompressedBuffer(format: aacFormat, packetCapacity: 1024, maximumPacketSize: 1024)
      var error: NSError?
      let status = self.converter.convert(to: outBuffer, error: &error) { _, outStatus in
        outStatus.pointee = .haveData
        return buffer
      }
      if status == .haveData {
        let data = Data(bytes: outBuffer.data, count: Int(outBuffer.byteLength))
        FileHandle.standardOutput.write(data)
      }
    }

    try engine.start()
  }
}
