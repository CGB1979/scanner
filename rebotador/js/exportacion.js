
function confirmarBorrarTodo(){
  if(!vehiculos.length) return;
  if(confirm('¿Borrar todos los vehículos cargados del listado? Esta acción solo afecta los datos cargados en Rebotador.')){
    vehiculos=[];
    actualizarSelectores();
    actualizarPantalla();
    document.getElementById('excelStatus').textContent='Listado borrado. Cargue un nuevo Excel para continuar.';
  }
}

function colLetra(n){
  let s='';
  n++;
  while(n>0){
    const m=(n-1)%26;
    s=String.fromCharCode(65+m)+s;
    n=Math.floor((n-1)/26);
  }
  return s;
}

function asegurarColumna(campo, titulo){
  let idx=datosExcel.columnas[campo];
  if(Number.isInteger(idx) && idx>=0) return idx;

  const headers=datosExcel.encabezados || [];
  idx=headers.length;
  headers[idx]=titulo;
  datosExcel.columnas[campo]=idx;

  const celda=colLetra(idx)+datosExcel.filaEncabezados;
  datosExcel.worksheet[celda]={t:'s',v:titulo};
  return idx;
}

function escribirCelda(fila, columna, valor){
  if(columna===null || columna===undefined || columna<0) return;
  const ref=colLetra(columna)+fila;
  datosExcel.worksheet[ref]={t:'s',v:String(valor ?? '')};
}

function exportarCSV(){
  if(!vehiculos.length){
    alert('No hay vehículos para exportar.');
    return;
  }

  // Si existe un Excel cargado, se conserva su libro y su estructura.
  if(datosExcel.workbook && datosExcel.worksheet){
    const c=datosExcel.columnas;
    const obs=asegurarColumna('observaciones','Observaciones');
    const mov=asegurarColumna('movidoDesde','Movido desde');

    vehiculos.forEach((v,i)=>{
      if(!v._filaExcel){
        const maxFila=Math.max(
          datosExcel.filaDatosInicio-1,
          ...vehiculos.map(x=>Number(x._filaExcel)||0)
        );
        v._filaExcel=maxFila+1+i;
      }
      const f=v._filaExcel;
      escribirCelda(f,c.chasis,v.chasis);
      escribirCelda(f,c.playa,v.playa);
      escribirCelda(f,c.bloque,v.bloque);
      escribirCelda(f,c.carril,v.carril);
      escribirCelda(f,c.posicion,v.posicion);
      escribirCelda(f,obs,v.observaciones||'');
      escribirCelda(f,mov,v.movidoDesde||'');
    });

    // Refrescar el rango utilizado.
    const maxCol=Math.max(...Object.values(datosExcel.columnas).filter(Number.isInteger), 0);
    const maxFila=Math.max(datosExcel.filaEncabezados,...vehiculos.map(v=>v._filaExcel||0));
    datosExcel.worksheet['!ref']=`A1:${colLetra(maxCol)}${maxFila}`;

    const nombreBase=(datosExcel.nombre||'rebotador').replace(/\.[^.]+$/,'');
    XLSX.writeFile(datosExcel.workbook,`${nombreBase}-rebotador.xlsx`);
    return;
  }

  const rows=vehiculos.map(v=>({
    Chasis:v.chasis,
    Playa:v.playa,
    Bloque:v.bloque,
    Carril:v.carril,
    Posición:v.posicion,
    Observaciones:v.observaciones||'',
    'Movido desde':v.movidoDesde||''
  }));
  const ws=XLSX.utils.json_to_sheet(rows);
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,'Rebotador');
  XLSX.writeFile(wb,'rebotador.xlsx');
}

function cerrarConfirmacion(){
  document.getElementById('confirmModal').classList.add('hidden');
}
