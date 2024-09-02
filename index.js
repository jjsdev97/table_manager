import { load } from "./module/loadJsonData.js";
import { TableManager } from "./module/table/TableManager.js";

const tableManager = new TableManager('tableContainer')
tableManager.dataSet = await load('pokeDex.json', 'pokemon');
// tableManager.dataSet = await load('panpan.json', 'data');
tableManager.attributes = ['num', 'name', 'type' ,'weaknesses'];
tableManager.attributesKor = [ '번호', '이름', '타입',  '약점'];
// tableManager.attributes = ['title', 'broadCastDate', 'broadCastURL', 'product'];
tableManager.listSize = 10;
tableManager.pagingSize = 7;
tableManager.make();


// tableManager.renderObject = {
//     target: 'next_evolution',
//     render: function(data, key, value){
//         //key:value~~ 형식
//     }
// }