import Foundation

let capture = AudioCapture()

do {
    try capture.startRecording()
    print("Recording system audio to WAV... Press Ctrl+C to stop.")
    signal(SIGINT) { _ in
        capture.stopRecording()
        exit(0)
    }
    RunLoop.main.run()
} catch {
    print("Error:", error)
}
