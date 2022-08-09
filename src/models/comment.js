const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const Comment = sequelize.define('comment', {
  // 在这里定义模型属性
  body: {// 内容
    type: DataTypes.TEXT
  }
});

module.exports = Comment