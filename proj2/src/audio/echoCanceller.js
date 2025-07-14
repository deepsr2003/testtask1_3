
export class LMSCanceller {
  constructor(tapCount = 128, step = 0.0005) {
    this.tapCount = tapCount;
    this.step = step;
    this.weights = new Float32Array(tapCount);
    this.buffer = new Float32Array(tapCount).fill(0);
  }

  process(refSample, micSample) {
    // Shift buffer left
    for (let i = this.tapCount - 1; i > 0; i--) {
      this.buffer[i] = this.buffer[i - 1];
    }
    this.buffer[0] = refSample;

    // Predict echo
    let y = 0;
    for (let i = 0; i < this.tapCount; i++) {
      y += this.weights[i] * this.buffer[i];
    }

    const e = micSample - y;

    // Update weights
    for (let i = 0; i < this.tapCount; i++) {
      this.weights[i] += this.step * e * this.buffer[i];
    }

    return e; // cleaned mic
  }
}
