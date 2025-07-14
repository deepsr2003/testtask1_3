// swift-tools-version: 5.7
import PackageDescription

let package = Package(
    name: "swift-cli",
    platforms: [
        .macOS(.v10_15)
    ],
    products: [
        .executable(
            name: "SystemCaptureCLI",
            targets: ["SystemCaptureCLI"]
        )
    ],
    targets: [
        .executableTarget(
            name: "SystemCaptureCLI",
            dependencies: [],
            path: "Sources/SystemCaptureCLI",
            exclude: [
                "entitlements.plist",
                "AudioCapture.md"
            ]
        )
    ]
)
