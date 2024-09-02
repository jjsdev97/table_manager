async function load(jsonFileName, jsonFieldName){
    const result = await fetchData(jsonFileName, jsonFieldName);

    return result;
}

async function fetchData(jsonFileName, jsonFieldName) {
    const data = await fetch(jsonFileName);
    
    const obj = await data.json();
    return obj[jsonFieldName]; 
}

export { load }