---
name: studio-promote
description: >-
  Promote a finished swingset studio recording to the "Studio — Ready to post" Notion database:
  encode an X-ready mp4, pull a poster frame, write the post copy and alt text, upload it all, and
  mark the showcase idea built. Use when someone has recorded a showcase video and wants it ready to
  post, or asks to promote, publish, or package a studio video.
---

# Promote a studio video

Input: the path to a recording of `/capture/<slug>` and the showcase slug. If either is missing, ask.
The slug picks the showcase in `packages/swingset/src/studio/showcases/` and its idea in
`packages/swingset/src/studio/ideas.json`, if it has one.

Ready-to-post entries live in the Notion database **Studio — Ready to post**:

- Database: https://app.notion.com/p/b8afbadf773d490f92282b80f034cd6d
- Data source: `collection://81ffcf11-945c-4879-8b75-8a840d5c5140`

Work in a fresh `mktemp -d` directory and tell the user its path at the end.

## 1. Encode the mp4

`ffprobe` the source for duration, size, and frame rate. X takes H.264 + AAC (or no audio), up to 60fps
and 1920×1200 (1200×1900 portrait). Notion uploads cap at 20 MiB, so target 18 MiB:
`kbps = min(10000, 18 * 8192 / seconds)`. Two-pass:

```sh
VF="scale=1920:1200:force_original_aspect_ratio=decrease:force_divisible_by=2"  # 1200:1900 for portrait, 1200:1200 for square
ffmpeg -y -i in.mov -vf "$VF" -fpsmax 60 -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
  -b:v ${kbps}k -pass 1 -an -f mp4 /dev/null
ffmpeg -y -i in.mov -vf "$VF" -fpsmax 60 -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
  -b:v ${kbps}k -pass 2 -an -movflags +faststart <slug>.mp4
```

Trim dead time at either end with `-ss`/`-to` only when the user asks. Check the output is under
20 MiB before uploading.

## 2. Pick a poster

Pull a contact sheet of candidates, look at it, and pick the frame that shows the feature at its
clearest (usually the end of the showcase's last step, not the first frame):

```sh
ffmpeg -i <slug>.mp4 -vf "fps=1,scale=480:-2,tile=4x3" -frames:v 1 sheet.png
ffmpeg -ss <seconds> -i <slug>.mp4 -frames:v 1 poster.png
```

## 3. Write the copy

Read the showcase file, its idea, and its PRs (`gh pr view <n> --json title,body,url`). Write
`post.md` with:

- **Post**: up to 280 characters. Lead with what the viewer sees, then the one detail a front-end
  developer would care about. American spelling, no hashtags, no emoji, no @-mentions.
- **Short**: a one-line variant under 120 characters.
- **Alt text**: up to 1000 characters, describing what happens on screen in order.
- **PRs**: links.

Mosaic work is often unreleased. Check whether the PRs' changesets have shipped (look for the change
in the package's `CHANGELOG.md`). If they haven't, don't write copy that says it's available, and add
an "Unreleased" warning at the top of the page.

Show the copy to the user and adjust it before uploading.

## 4. Upload to Notion

For the mp4 and the poster, call `notion-create-file-upload`, then POST the file to `upload_url` once:
`curl -sS -X POST "$URL" <-H for each upload_headers entry> -F "file=@<path>"`.

Create one page in the data source with `notion-create-pages`:

- Properties: `Name` (the idea's title), `Status` `Ready`, `Showcase` (slug), `PRs` (`#10414, #10421`),
  `Format`, `Seconds`, `Video` and `Poster` (the upload IDs), `Promoted by` (the user from
  `notion-get-self`).
- Body: the video and poster, placed with each upload's `markdown_source`, then the sections from
  `post.md`.

## 5. Close the idea

In `ideas.json`, set the idea's `status` to `built` and `notion` to the page URL. If the showcase has no
idea, skip this step. Then give the user the Notion link and remind them that `ideas.json` needs
committing.
