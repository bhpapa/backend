const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const Tag = sequelize.define('tag', {
  // 在这里定义模型属性
  name: {// 标签名
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  }
},
{
  timestamps: false
});

module.exports = Tag