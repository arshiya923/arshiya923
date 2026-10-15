# Bilingual Résumé Project

## Source of truth

`resume-data.json` is the structured source of truth. It contains every fact and the approved Persian and English wording. Edit that file first; do not edit generated HTML or text files directly because they will be overwritten.

`resume.css` controls the A4, single-column visual design. `generate-pdf.mjs` reads the JSON, regenerates both HTML and plain-text versions, and then prints text-selectable PDFs through the bundled Playwright runtime and local Chrome.

## Files

- `resume-data.json`: verified bilingual data and wording
- `resume.css`: screen and print styles
- `resume-en.html`, `resume-fa.html`: editable/local-viewable semantic HTML
- `resume-en.txt`, `resume-fa.txt`: ATS-friendly plain text
- `resume-en.pdf`, `resume-fa.pdf`: final text-selectable PDFs
- `profile-photo.jpg`: public GitHub profile photograph requested by the résumé owner
- `job-match-report.md`: private gap and interview-preparation analysis; not résumé content
- `generate-pdf.mjs`: HTML, text, and PDF generator

## Regenerate

From this directory in PowerShell:

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" .\generate-pdf.mjs
```

If the bundled runtime is unavailable, install Playwright and set `CHROME_PATH` to Chrome or Edge before running the script.

## Fonts

English uses Inter when installed, followed by Arial and Calibri. Persian uses Vazirmatn when installed, followed by Tahoma and Arial. No proprietary or downloaded font files are distributed.

## Notes

- Persian dates use the Jalali calendar; English dates use Gregorian dates.
- The public GitHub photograph is included in both versions at the owner's explicit request.
- The HTML files work locally and preserve clickable email, LinkedIn, and GitHub links.
- The PDFs are generated with ordinary text, not screenshots or canvas-rendered text.
