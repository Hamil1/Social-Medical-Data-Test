// Handler para obtener todos los insumos (mock)
exports.getAllInsumosHandler = async (event) => {
  // Aquí deberías consultar la base de datos real, pero para desarrollo puedes usar un mock
  const insumos = require('../mocks/inventario.json');
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*',
    },
    body: JSON.stringify(insumos),
  };
};
