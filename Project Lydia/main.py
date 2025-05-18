import pyaudio
import struct
import pvporcupine
import json
import whisper
import numpy as np
from openwakeword.model import Model

# Instantiate the model(s)

def my_function_to_get_audio_frame():
    pa = pyaudio.PyAudio()

    stream = pa.open(
        format=pyaudio.paInt16,
        channels=1,
        rate=porcupine.sample_rate, # Set the rate to 16000 Hz for 16kHz audio
        input=True,
        frames_per_buffer=porcupine.frame_length,
    )

    while True:
        data = stream.read(porcupine.frame_length)
        data = np.frombuffer(data, dtype=np.int16)

        result = porcupine.process(data)

        if result >= 0:
            print(f"keyword found! {result}")

with open("keys.json", "r") as file:
    keys = json.load(file)

porcupine = pvporcupine.create(access_key=keys["picovoice"], keyword_paths=["wakewords/Hey-Lydia_en_windows_v3_0_0.ppn"])

my_function_to_get_audio_frame()

# Get audio data containing 16-bit 16khz PCM audio data from a file, microphone, network stream, etc.
# For the best efficiency and latency, audio frames should be multiples of 80 ms, with longer frames
# increasing overall efficiency at the cost of detection latency

