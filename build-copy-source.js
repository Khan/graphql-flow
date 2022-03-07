// A simple script to copy over source files as *.js.flow
// so that flow will be happy with the distributed package.

const fs = require('fs');
const path = require('path');

// little recursive walk
const walk = (dir, fn) => {
    fs.readdirSync(dir).forEach((name) => {
        const full = path.join(dir, name);
        if (fs.statSync(full).isDirectory()) {
            walk(full, fn);
        } else {
            fn(full);
        }
    });
};

const src = __dirname + '/src';
const dist = __dirname + '/dist';

walk(src, (name) => {
    if (!name.endsWith('.js') || name.includes('__test__')) {
        return;
    }
    const next = path.join(dist, path.relative(src, name)) + '.flow';
    fs.copyFileSync(name, next);
});
