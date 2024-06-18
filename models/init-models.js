var DataTypes = require("sequelize").DataTypes;
var _data = require("./data");
var _info = require("./info");

function initModels(sequelize) {
  var data = _data(sequelize, DataTypes);
  var info = _info(sequelize, DataTypes);

  data.belongsTo(info, { as: "idx_info", foreignKey: "idx"});
  info.hasMany(data, { as: "data", foreignKey: "idx"});

  return {
    data,
    info,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;