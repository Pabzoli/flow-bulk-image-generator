# 🖼️ Flow Bulk Image Generator

A Chrome extension for automating bulk image generation on [Google Flow](https://labs.google/fx/tools/flow/) with reference image support, random cooldowns, and auto-download features.

## Features

✅ **Bulk Prompt Processing** - Paste multiple prompts (one per line), and generate all at once  
✅ **Reference Image Support** - Upload ONE reference image applied to all prompts  
✅ **Random Cooldowns** - Configurable random delay (10-15s) between prompts for natural automation  
✅ **Auto-Download** - Automatically download generated images with sequence numbering (001.png, 002.png, etc.)  
✅ **Stealth Mode** - Human-like typing and interaction patterns to avoid detection  
✅ **Customizable Settings** - Model, aspect ratio, image count, and quality selection  
✅ **Progress Tracking** - Real-time progress bar and status updates  
✅ **Pause/Resume** - Pause and resume generation at any time  

## Installation

### 1. Clone or Download This Repository
```bash
git clone https://github.com/Pabzoli/flow-bulk-image-generator.git
cd flow-bulk-image-generator
```

### 2. Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `flow-bulk-image-generator` folder
5. The extension icon should appear in your toolbar

## Usage

### Step 1: Open Google Flow
Navigate to [labs.google/fx/tools/flow/](https://labs.google/fx/tools/flow/) and open or create a project.

### Step 2: Open the Extension
Click the Flow Bulk Image Generator icon in your Chrome toolbar.

### Step 3: Upload Reference Image
- Click the dashed box or drag-and-drop an image
- This image will be applied to all prompts
- ⚠️ Reference image is **required**

### Step 4: Enter Prompts
Paste your bulk prompts in the textarea, **one per line**:
```
a red apple on a wooden table
an underwater city with bioluminescent creatures
a steampunk robot in a forest
```

### Step 5: Configure Settings
- **Model** - Choose generation model (Nano Banana 2, Imagen 4, etc.)
- **Aspect Ratio** - Landscape, Portrait, Square, etc.
- **Images per Prompt** - How many images to generate per prompt
- **Download Quality** - 1K (original), 2K, or 4K

### Step 6: Set Cooldown
- **Min Delay** - Minimum seconds between prompts (default: 10s)
- **Max Delay** - Maximum seconds between prompts (default: 15s)
- Random delay between min-max is applied between each prompt

### Step 7: Enable/Disable Features
- **Auto-Download** - Automatically download images (enabled by default)
- **Stealth Mode** - Human-like interaction patterns (enabled by default)

### Step 8: Start Generation
Click **▶️ Start** and watch the progress bar.
- **⏸ Pause** - Pause and resume anytime
- **⏹ Stop** - Cancel the entire batch

## Settings Persistence

All settings are saved to Chrome Storage and persist across sessions:
- Model selection
- Aspect ratio
- Image count
- Download quality
- Delay ranges
- Toggle states

## How It Works

1. **Prompt Injection** - Automatically types or pastes each prompt into the Flow editor
2. **Settings Application** - Applies model, aspect ratio, and other settings
3. **Reference Image Upload** - Uploads and attaches your reference image (first prompt only)
4. **Submission** - Clicks the submit button and waits for generation
5. **Auto-Download** - Downloads the generated image(s) with sequence numbering
6. **Cooldown Wait** - Waits random delay before next prompt
7. **Loop** - Repeats for all prompts

## File Structure

```
flow-bulk-image-generator/
├── manifest.json          # Extension configuration
├── popup.html             # UI panel
├── popup.js               # Popup logic & settings
├── content.js             # Flow automation logic
├── background.js          # Service worker
└── README.md              # This file
```

## Stealth Mode Details

**Stealth Mode** simulates human behavior:
- Random typing delays (30-125ms per character)
- Variable pause times at word boundaries
- Human-like paste simulation for long prompts
- Randomized interaction timings

## Troubleshooting

### "Google Flow tab not found"
- Make sure you have a Flow tab open
- Extension only works on `labs.google/fx/tools/flow/*`

### "Editor not found"
- Make sure you're on a Flow project page (not the home/list view)
- Reload the Flow tab and try again

### "Reference image upload failed"
- Check that the image is a valid format (JPG, PNG, WebP)
- Try uploading to Flow manually first to ensure it works

### Images not downloading
- Ensure **Auto-Download** is enabled in settings
- Check Chrome's download settings (chrome://settings/downloads)
- Allow downloads for labs.google domain

### Generation stuck/not progressing
- Click **⏹ Stop** and try again
- Reload the Flow tab
- Check browser console for errors (F12 > Console)

## Limitations

- ⚠️ Works only on Google Flow (labs.google/fx/tools/flow/)
- ⚠️ Requires a valid Google account with Flow access
- ⚠️ Generation speed depends on Flow's API rate limits
- ⚠️ Auto-download requires browser download permissions

## Performance Tips

1. **Use realistic cooldowns** - 10-15s is recommended to avoid rate limiting
2. **Keep prompts concise** - Longer prompts may generate slower
3. **Monitor quota** - Check your Flow quota before large batches
4. **Stealth mode on** - Enables more natural interaction patterns
5. **Single tab** - Only run one batch at a time

## Support

For issues or feature requests, open a GitHub issue.

## License

MIT License - Feel free to modify and distribute

## Disclaimer

This extension is not affiliated with Google. Use responsibly and in accordance with Google Flow's Terms of Service.
