#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');

const colors = require('colors');

const util = require('util');

var ColorLS = class ColorLS {

	constructor(input, report) {
		this.input = input || process.cwd();
		this.contents = fs.readdirSync(this.input);
		this.count = {
			folders: 0,
			recognized_files: 0,
			unrecognized_files: 0
		};
		this.report = report;
		this.screen_width = process.stdout.columns;
		this.max_widths = this.contents.map(x => x.length);

		this.init_icons();
	}

	ls() {
		this.contents = this.chunkify();
		this.contents.forEach((chunk) => this.ls_line(chunk));
		process.stdout.write(util.format('\n'));
		if (this.report) {
			display_report();
		}
	}

	init_icons() {
		this.files = this.load_from_yaml('./files.yaml');
		this.file_aliases = this.load_from_yaml('./file_aliases.yaml', true);
		this.folders = this.load_from_yaml('./folders.yaml');
		this.folder_aliases = this.load_from_yaml('./folder_aliases.yaml');

		this.file_keys = Object.keys(this.files);
		this.file_alias_keys = Object.keys(this.file_aliases);
		this.folder_keys = Object.keys(this.folders);
		this.folder_alias_keys = Object.keys(this.folder_aliases);

		this.all_files = this.file_keys.concat(this.file_alias_keys);
		this.all_folders = this.folder_keys.concat(this.folder_alias_keys);
	}

	chunkify() {
		var chunk;
		var chunk_size = this.contents.length;
		while (!(this.in_line(chunk_size) || chunk_size <= 1)) {
			chunk_size -= 1;
			chunk = this.get_chunk(chunk_size);
		}
		return chunk || [this.contents];
	}

	get_chunk(chunk_size) {
		var chunk = [];
		var i = 0;
		var currentChunk = [];
		while (i < this.contents.length) {
			currentChunk.push(this.contents[i++]);
			if (currentChunk.length === chunk_size) {
				chunk.push(currentChunk);
				currentChunk = [];
			}
		}
		while (currentChunk.length < chunk_size) {
			currentChunk.push('');
		}
		var transposed = chunk[0].map(function(col, i) {
			return chunk.map(function(row) {
				return row[i];
			});
		});
		this.max_widths = transposed.map(row => Math.max(... row.map(s => s.length)));
		return chunk;
	}

	in_line(chunk_size) {
		return !(this.max_widths.reduce((a, b) => a + b, 0) + 6 * chunk_size > this.screen_width);
	}

	display_report() {
		process.stdout.write(util.format(`\n Found ${this.contents.length} contents in directory `.white));

		process.stdout.write(util.format(this.input.blue));

		process.stdout.write(util.format(`\n\n\tFolders\t\t\t: ${this.count.folders}`.white));
		process.stdout.write(util.format(`\n\tRecognized files\t: ${this.count.recognized_files}`.white));
		process.stdout.write(util.format(`\n\tUnrecognized files\t: ${this.count.unrecognized_files}`.white));
	}

	fetch_string(content, key, color, increment) {
		this.count[increment] += 1;
		var value = increment === 'folders' ? this.folders[key] : this.files[key];
		// todo -- port this line
		// how it works for my future self:
		// 	- value.gsub(/\\u[\da-f]{4}/i) matches and replaces all strings that look like unicode characters
		//  - it does the replacement by running each match through the function m -> m[-4..-1.to_i(16)].pack('U')
		// this last part needs to be disected still, but it seems to make enough sense.
		// logo  = value.gsub(/\\u[\da-f]{4}/i) { |m| [m[-4..-1].to_i(16)].pack('U') }
		return `${value}  ${content}`[color];
	}

	load_from_yaml(filename, aliases) {
		const location = path.join(__dirname, filename);
		var loaded = yaml.safeLoad(fs.readFileSync(location, 'utf8'));
		return loaded;
	}

	ls_line(chunk) {
		process.stdout.write(util.format('\n'));
		for (var i = 0; i < chunk.length; ++i) {
			var content = chunk[i];
			if (content.length === 0) {
				break;
			}
			var opt = this.options(content);
			var fetch = this.fetch_string(content, opt[0], opt[1], opt[2]);
			process.stdout.write(util.format(fetch));
			var isFile = fs.existsSync(`${this.input}/${content}`) &&
				fs.lstatSync(`${this.input}/${content}`).isDirectory();
			process.stdout.write(util.format(isFile ? '/ '.blue : '  '));
			var space = new Array(this.max_widths[i] - content.length + 2).join(' ');
			process.stdout.write(util.format(space));
		}
	}

	options(content) {
		var key;
		if (fs.existsSync(`${this.input}/${content}`) &&
				fs.lstatSync(`${this.input}/${content}`).isDirectory()) {
			key = content;
			if (!this.all_folders.hasOwnProperty(key)) {
				return ['folder', 'blue', 'folders'];
			}
			if (this.folder_keys.indexOf(key) === -1) {
				key = this.folder_alises[key];
			}
			return [key, 'blue', 'folders'];
		}
		var split = content.split('.');
		key = split[split.length - 1].toLowerCase();
		if (this.all_files.indexOf(key) === -1) {
			return ['file', 'yellow', 'unrecognized_files'];
		}
		if (this.file_keys.indexOf(key) === -1) {
			key = this.file_aliases[key];
		}
		return [key, 'green', 'recognized_files'];
	}

};

var args = process.argv.slice(2);

var report = args.indexOf('--report') !== -1 || args.indexOf('-r') !== -1;

var filtered = args.filter((arg) => !arg.startsWith('-'));

if (filtered.length === 0) {
	new ColorLS(null, report).ls();
} else {
	args.forEach((path) => {
		ColorLS.new(path, report).ls();
	});
}


