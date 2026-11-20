import json
from dotenv import load_dotenv
import os

def sort_json_file(start, end):
    load_dotenv()

    with open(f"conv/xarray-{start}_{end}.json") as file:
        data = json.load(file)
        
    new_data = []
    for i in range(len(data["time"])):
        if data["NearNadir_Composite_Snow_Free"][str(i)] is None:
            continue
        
        new_data.append({"time": data["time"][str(i)], "x": data["x"][str(i)], "y": data["y"][str(i)], "NearNadir_Composite_Snow_Free": data["NearNadir_Composite_Snow_Free"][str(i)]})

    with open(f"sorted/xarray-{start}_{end}.json", 'w') as file:
        json.dump(new_data, file)

def sort_json(data):
    new_data = []
    for i in range(len(data["time"])):
        if data["NearNadir_Composite_Snow_Free"][str(i)] is None:
            continue
        
        new_data.append({"time": data["time"][str(i)], "x": data["x"][str(i)], "y": data["y"][str(i)], "NearNadir_Composite_Snow_Free": data["NearNadir_Composite_Snow_Free"][str(i)]})
    
    return new_data