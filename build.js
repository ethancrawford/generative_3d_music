const esbuild = require('esbuild');
const sass = require('sass');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

// Compile Sass
function compileSass() {
  try {
    const result = sass.compile('src/styles/main.scss', {
      style: isWatch ? 'expanded' : 'compressed',
      sourceMap: isWatch
    });
    
    // Ensure dist directory exists
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist', { recursive: true });
    }
    
    fs.writeFileSync('dist/styles.css', result.css);
    if (result.sourceMap && isWatch) {
      fs.writeFileSync('dist/styles.css.map', JSON.stringify(result.sourceMap));
    }
    
    console.log('Sass compiled successfully');
  } catch (error) {
    console.error('Sass compilation error:', error);
  }
}

const buildOptions = {
  entryPoints: ['src/main.js'],
  bundle: true,
  outfile: 'dist/bundle.js',
  format: 'esm',
  target: 'es2020',
  sourcemap: true,
  minify: !isWatch,
  define: {
    'process.env.NODE_ENV': isWatch ? '"development"' : '"production"'
  }
};

// Initial compilation
compileSass();

if (isWatch) {
  // Watch for Sass changes
  fs.watchFile('src/styles/main.scss', () => {
    console.log('Sass file changed, recompiling...');
    compileSass();
  });
  
  // Watch for changes in any .scss file in styles directory
  if (fs.existsSync('src/styles')) {
    fs.readdirSync('src/styles').forEach(file => {
      if (file.endsWith('.scss')) {
        fs.watchFile(path.join('src/styles', file), () => {
          console.log(`${file} changed, recompiling Sass...`);
          compileSass();
        });
      }
    });
  }
  
  esbuild.context(buildOptions).then(ctx => {
    ctx.watch();
    console.log('Watching for JS changes...');
  });
} else {
  esbuild.build(buildOptions).catch(() => process.exit(1));
}