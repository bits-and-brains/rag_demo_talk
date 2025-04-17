'use strict';

exports.up = function(db, callback) {
  db.runSql(`
    CREATE TABLE IF NOT EXISTS logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      content TEXT NOT NULL,
      logger VARCHAR(255) NOT NULL,
      severity VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `, callback);
};

exports.down = function(db, callback) {
  db.runSql('DROP TABLE IF EXISTS logs;', callback);
}; 