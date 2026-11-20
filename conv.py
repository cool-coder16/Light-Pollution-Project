import xarray as xr
from dotenv import load_dotenv
import os
from get_xarray import get_xarray
import json

def conv_xarray_file(start, end):
    load_dotenv()

    data = xr.open_dataset(f"raw/xarray-{start}_{end}.nc")
    data.to_dataframe().reset_index().to_json(f"conv/xarray-{start}_{end}.json")

def conv_xarray(xarr):
    return json.loads(xarr.to_dataframe().reset_index().to_json())

if __name__ == "__main__":
    print(conv_xarray(get_xarray("2026-06-01", "2026-07-01")))