---
name: tts
description: Convert any script or text to high-quality speech cloned from my personal voice sample (local, offline, Ubuntu).
tags: [tts, voice-clone, audio, speech, script]
---

# Script → My Voice (Cloned)

**When to use this skill:**
- User wants any text/script turned into natural speech in **their exact voice**.
- Long-form narration, video voice-overs, podcasts, agents, etc.

**How the skill works (Agent will do this automatically):**
1. Take the provided script/text.
2. (Optional) Use Ollama to clean/format the script if messy.
3. Call the local Chatterbox TTS backend with your `voice_sample.wav`.
4. Generate a WAV file in the project root (or specified path).
5. Return the exact file path so you can play it instantly (`paplay output.wav` or VLC).

**Usage examples you can say to agent:**
- "Convert this script to my voice: [paste script]"
- "Make a 2-minute narration of the README in my voice"
- "Turn the last message into speech using my cloned voice"

CLI usage notes:
- Provide the transcript directly as the positional argument: `tts_clone.py "My script text..."`
- Or provide a transcript string via `--prompt-str`: `tts_clone.py --prompt-str "My script..."`
- Or point to a transcript file with `--prompt-file`: `tts_clone.py --prompt-file ./my_script.txt`
- If no transcript is provided, the tool will read from `stdin`.

When used as a skill, pass the prompt text via the prompt field (CLI `--prompt-str`) or supply a file path with `--prompt-file` so the script reads the intended transcript instead of a hardcoded string.

**Reference audio:** Uses `voice_sample.wav` placed in the skill folder (or full path you provide).

When executing the TTS script, always run it with:
```bash
uv run ./tts_clone.py "Your text here" ...
```