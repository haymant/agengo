#!/usr/bin/env python3
import argparse
import soundfile as sf
from chatterbox.tts import ChatterboxTTS
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Agent Skill: Script → My Cloned Voice")
    parser.add_argument("text", nargs="?", help="Text/script to speak (or read from stdin)")
    parser.add_argument("--prompt-file", help="Path to a file containing the transcript/prompt")
    parser.add_argument("--prompt-str", help="Transcript/prompt provided as an argument string")
    parser.add_argument("--ref", default="voice_sample.wav", help="Path to your voice sample (default: voice_sample.wav in skill dir)")
    parser.add_argument("--output", default="output_my_voice.wav", help="Output WAV path")
    args = parser.parse_args()

    # Resolve transcript source in priority order:
    # 1) positional `text` arg, 2) --prompt-str, 3) --prompt-file, 4) stdin
    if args.text:
        transcript = args.text
    elif args.prompt_str:
        transcript = args.prompt_str
    elif args.prompt_file:
        pf = Path(args.prompt_file).expanduser()
        if not pf.exists():
            print(f"ERROR: Prompt file not found: {pf}")
            exit(1)
        transcript = pf.read_text(encoding="utf-8").strip()
    else:
        import sys
        transcript = sys.stdin.read().strip()

    ref_path = Path(args.ref).resolve()
    if not ref_path.exists():
        print(f"ERROR: Reference audio not found: {ref_path}")
        print("Place your voice_sample.wav in the skill folder or use --ref /full/path")
        exit(1)

    print(f"🔊 Cloning your voice from: {ref_path}")
    print(f"📝 Generating: {transcript[:100]}...")

    # Instantiate model from pretrained weights (downloads if needed)
    model = ChatterboxTTS.from_pretrained(device="cpu")
    wav_tensor = model.generate(transcript, audio_prompt_path=str(ref_path))

    # Convert Torch tensor to numpy array and write with soundfile
    try:
        import torch
        wav = wav_tensor.squeeze().detach().cpu().numpy()
    except Exception:
        wav = wav_tensor

    output_path = Path(args.output).resolve()
    # Write to a temporary file with .wav extension if the requested output has no suffix,
    # then copy the binary data to the final name so libsndfile doesn't error on dotfiles.
    if output_path.suffix == "":
        temp_path = output_path.with_suffix('.wav')
        sf.write(str(temp_path), wav, model.sr)
        # Copy binary bytes to the requested dotfile name
        import shutil
        shutil.copyfile(str(temp_path), str(output_path))
    else:
        sf.write(str(output_path), wav, model.sr)

    print(f"✅ Done! Audio saved to: {output_path}")
    print(f"Play it with: paplay {output_path}   or open in VLC")

if __name__ == "__main__":
    main()