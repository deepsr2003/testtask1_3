
import { LMSCanceller } from './echoCanceller.js';

class EchoCancellerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.canceller = new LMSCanceller(128, 0.0005); // 128 taps, step-size
  }

  process(inputs, outputs) {
    const [inputSystem, inputMic] = inputs;
    const output = outputs[0];

    if (!inputSystem[0] || !inputMic[1]) return true;

    const sys = inputSystem[0];
    const mic = inputMic[1];
    const out = output[0];

    for (let i = 0; i < sys.length; i++) {
      out[i] = this.canceller.process(sys[i], mic[i]);
    }

    return true;
  }
}

registerProcessor('echo-canceller', EchoCancellerProcessor);
