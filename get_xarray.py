import os
import geopandas as gpd
from dotenv import load_dotenv
from blackmarble import BlackMarble, Product
import pandas as pd

def get_xarray(start, end, geojson="location.geojson", download=False):
    load_dotenv()
    gdf = gpd.read_file(geojson)
    bm = BlackMarble(token=os.environ["EARTHDATA_TOKEN"])

    date_range = pd.date_range(start, end, freq="D").date.tolist()
    
    data = bm.raster(
        gdf,
        product_id=Product.VNP46A3,
        date_range=date_range
    )

    if download:
        os.makedirs("raw", exist_ok=True)
        data.to_netcdf(f"raw/xarray-{start}_{end}.nc")
    
    return data