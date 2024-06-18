const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const tttt = sequelize.define('data', {
    idx: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'info',
        key: 'idx'
      }
    },
    name: {
      type: DataTypes.STRING(1024),
      allowNull: false
    },
    task1: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    task2: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    task3: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    task4: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    task5: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'data',
    timestamps: false,
    indexes: [
      {
        name: "idx_info",
        using: "BTREE",
        fields: [
          { name: "idx" },
        ]
      },
    ]
  });
  tttt.removeAttribute('id');
  return tttt;
};
