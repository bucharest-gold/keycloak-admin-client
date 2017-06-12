'use strict';

const sleep = (ms) => {
  const currentTime = new Date().getTime();
  while (currentTime + ms >= new Date().getTime()) { }
};

module.exports = { sleep };
