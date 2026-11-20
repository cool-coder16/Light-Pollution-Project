from get_xarray import *
from conv import *
from sort import *

def get_full_json(start, end, geojson="location.geojson", download=False):
    data = sort_json(conv_xarray(get_xarray(start, end, geojson)))
    
    if download:
        with open(f"sorted/data-{start}_{end}.json", 'w') as file:
            json.dump(data, file)
    
    return data

if __name__ == "__main__":
    get_full_json("2012-01-01", "2026-09-01", download=True)