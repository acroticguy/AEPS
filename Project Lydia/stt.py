import whisper
import pyaudio
import numpy as np

class STT:
    def __init__(self, model="tiny.en"):
        self.model = whisper.load_model(model)

        pa = pyaudio.PyAudio()

        self.stream = pa.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=16000, # Set the rate to 16000 Hz for 16kHz audio
            input=True,
            frames_per_buffer=1024,
        )

        whisper.DecodingOptions()

    def record(self):
        while True:
            data = self.stream.read(1024)
            data = np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0

            audio_np_resampled = whisper.pad_or_trim(data, length=16000)
            mel = whisper.log_mel_spectrogram(audio_np_resampled, n_mels=80)
            result = self.model.decode(mel, whisper.DecodingOptions())
            text = self.model.tokenizer.decode(result.tokens, skip_special_tokens = True)

            # Display transcribed text
            if text.strip():
                print("Transcribed:", text)

stt = STT()
stt.record()
