import { load } from "./module/loadJsonData.js";
import { TableManager } from "./module/table/TableManager.js";

const tableManager = new TableManager('tableContainer')
tableManager.dataSet = await load('pokeDex.json', 'pokemon');
tableManager.attributes = ['num', 'name', 'type' ,'weaknesses', 'next_evolution'];
tableManager.attributesKor = [ '번호', '이름', '타입',  '약점'];
tableManager.listSize = 10;
tableManager.pagingSize = 7;
tableManager.addObjectAttribute('next_evolution', 'name');
tableManager.make();

console.log(tableManager);