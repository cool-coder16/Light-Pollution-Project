# Light Pollution Project

Monthly nighttime light over San Jose, California, from NASA's Black Marble
satellite data, graphed in the browser. The Python scripts download and
prepare the data. The website lets you pick a date range and see the average
brightness for each month.

The graph covers January 2012 to September 2026 (the data NASA had when this
was written).

## What the number means

The graph plots **average nighttime radiance in nW/cm²/sr** (nanowatts per
square centimeter per steradian) across the pixels covering the area in
`location.geojson`. It comes from the `NearNadir_Composite_Snow_Free` variable
of NASA's monthly **VNP46A3** product:

- **Near nadir**: only observations where the satellite looked almost straight
  down.
- **Composite**: many nights combined into one monthly value.
- **Snow free**: nights with snow on the ground are excluded.

Higher means brighter ground at night. It measures light going up from the
ground, which is related to sky glow but is not the same thing. Compare months
with each other rather than reading any one value as good or bad.

## Files

| File | What it does |
| --- | --- |
| `get_xarray.py` | Downloads the monthly rasters from NASA and clips them to the area |
| `conv.py` | Converts the downloaded data to JSON |
| `sort.py` | Drops empty pixels and keeps `time`, `x`, `y` and the radiance value |
| `main.py` | Runs the three steps and writes `sorted/data-<start>_<end>.json` |
| `location.geojson` | The area to download (San Jose) |
| `sorted/` | The prepared data the website loads |
| `index.html`, `style.css`, `script.js` | The website |

## Setup

You need Python 3.10 or newer. It was developed on Python 3.12.

Install the dependencies:

```bash
pip install blackmarblepy geopandas python-dotenv xarray pandas
```

If you want to save the raw downloads as `.nc` files, also install a NetCDF
writer, for example `pip install scipy`.

### Setting up your own `.env`

The download needs a free NASA Earthdata token. The repository does **not**
include one, so you make your own:

1. Create a free account at <https://urs.earthdata.nasa.gov/>.
2. Sign in, open your profile at <https://urs.earthdata.nasa.gov/profile>, and
   generate a token (look for "Generate Token"). Copy it.
3. Make sure your account has approved the LAADS DAAC application, which hosts
   the Black Marble files. This is under **Applications**, then **Authorized
   Apps** on your Earthdata profile. Also accept any end-user license
   agreements it shows.
4. In the project folder, create a file named `.env` containing one line:

   ```
   EARTHDATA_TOKEN=paste-your-token-here
   ```

   No quotes and no spaces around the `=`.

`.env` is listed in `.gitignore`, so it won't be committed. **Never commit or
share your token.** Earthdata tokens expire after about 60 days. When yours
stops working, generate a new one and replace the line.

If a download fails with `Received an HTML response, which likely indicates an
invalid or expired NASA Earthdata token`, the token is expired, mistyped, or
the LAADS DAAC application isn't authorized for your account (step 3).

## Getting the data

Edit the date range at the bottom of `main.py`, then run it:

```bash
python3 main.py
```

This downloads the monthly files (a few tens of MB each for one tile, so the
full 2012 to 2026 range is several GB and takes a while), then writes
`sorted/data-<start>_<end>.json`. Interrupted runs pick up where they stopped,
because already-downloaded files are skipped.

To use a different place, replace `location.geojson` with your own area.

## Running the website

Browsers block `fetch` on pages opened straight from disk, so serve the folder
with a local server:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

The page loads `sorted/data-<start>_<end>.json` using the dates in the two
date boxes when the page first loads (the defaults in `index.html`). The file
for exactly that range must exist. If you generate a different range, change
the `value`, `min` and `max` attributes of the date inputs in `index.html` to
match. After the file loads, changing the dates filters it in the browser.

## Data source

NASA Black Marble nighttime lights, product VNP46A3 (VIIRS), distributed by
NASA's LAADS DAAC. Downloads use the
[`blackmarblepy`](https://pypi.org/project/blackmarblepy/) package. See NASA's
Black Marble documentation for how the product is made and its limits.

## License

MIT. See [`LICENSE`](LICENSE).
