// Basic tests for Zapete
const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Test that package.json exists and is valid
describe('Package Configuration', () => {
  it('should have valid package.json', () => {
    const packagePath = path.join(__dirname, '..', 'package.json');
    assert(fs.existsSync(packagePath), 'package.json should exist');

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    assert(packageJson.name === 'Zapete', 'Package name should be Zapete');
    assert(packageJson.version, 'Package should have version');
  });

  it('should have main application files', () => {
    const files = [
      'index.html',
      'js/server.js',
      'js/client.js',
      'src/css/zapete.css'
    ];

    files.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      assert(fs.existsSync(filePath), `${file} should exist`);
    });
  });

  it('should have packaging files', () => {
    const files = [
      'snapcraft.yaml',
      'debian/control',
      'org.zapete.Zapete.yml'
    ];

    files.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      assert(fs.existsSync(filePath), `${file} should exist`);
    });
  });
});

// Test that server can start (basic smoke test)
describe('Server Startup', () => {
  it('should start server without throwing', function(done) {
    this.timeout(10000); // 10 second timeout

    const { spawn } = require('child_process');
    const server = spawn('node', ['js/server.js'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });

    let output = '';
    server.stdout.on('data', (data) => {
      output += data.toString();
    });

    server.stderr.on('data', (data) => {
      output += data.toString();
    });

    // Wait a bit for server to start
    setTimeout(() => {
      server.kill('SIGTERM');

      // Check if server started successfully
      assert(output.includes('HTTP server started'), 'Server should start HTTP server');
      assert(output.includes('WebSocket server is listening'), 'Server should start WebSocket server');

      done();
    }, 3000);
  });
});
