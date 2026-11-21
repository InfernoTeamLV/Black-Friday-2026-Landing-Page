# Cinematic hero asset

Archived concept: the page now uses the supplied training and studio photos.
These generated assets remain in `design-assets/` for provenance and are excluded
from the public build.

Created November 16, 2026 using the built-in Imagegen tool. This is illustrative
campaign artwork, not a photograph of an actual Inferno member or location.

Saved project files:

- `design-assets/pilates-cinematic-original.png`: original generated photograph.
- `design-assets/pilates-cinematic-560.webp`: archived 560 x 700 responsive image.
- `design-assets/pilates-cinematic-1120.webp`: archived 1120 x 1400 responsive image.

The source image was resized and encoded as WebP at quality 82 with Sharp 0.35.5
using an existing workspace installation. No new runtime dependency was added.
The generated files stay in the source repository for future asset work. The
current static build ships the supplied photos instead.

## Final generation prompt

```text
Use case: photorealistic-natural
Asset type: portrait hero photograph for the LEFT half of a cinematic split-screen Hot Pilates landing page.
Primary request: a premium black-and-white fitness editorial. An athletic adult woman in her late twenties with dark hair tied back, wearing a plain black sports bra and black leggings, preparing for a mat Pilates workout in a dark minimal studio. She is in a strong low forward lunge, one knee bent and one knee on the black mat, torso upright, hands resting gently on the front thigh, photographed from a low three-quarter side angle. Natural convincing anatomy and posture. Calm focus, physical strength, no smile at camera.
Composition: portrait 4:5 image, athlete positioned in the central lower two-thirds, full body with feet and hands visible, generous dark studio atmosphere above and around her. Subject must remain clear in a centered portrait crop. This is just a photograph, not a website mockup.
Lighting/mood: cinematic hard side light from high studio windows on the left, deep sculptural shadows, a little atmospheric haze catching diagonal light, subtle analog film grain, tactile rubber mat. Luxury sports editorial, authentic skin texture, high contrast but preserve details in highlights. Entire image strictly neutral black and white with no colored tint.
Constraints: exactly one adult, minimal empty background, no text, logos, borders, watermark, weights, reformer machine, interface or other people.
```
