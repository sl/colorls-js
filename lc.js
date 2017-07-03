'use strict';

const fs = require('fs');

const yaml = require('js-yaml');

var ColorLS = class ColorLS {

	constructor(input, report) {
		this.input = input || process.cwd();
		this.contents = fs.readdirSync(input);
		this.count = {
			folders: 0,
			recognized_files: 0,
			unrecognized_files: 0
		};
		this.report = report;
		this.screen_width = process.stdout.columns;

		this.init_icons();
	}

	init_icons() {
		this.files = load_from_yaml('files.yaml');
		this.file_aliases = load_from_yaml('file_aliases.yaml', true);
		this.folders = load_from_yaml('folders.yaml');
		this.folder_aliases = load_from_yaml('folder_aliases.yaml');

		this.file_keys = Object.keys(this.files);
		this.file_alias_keys = Object.keys(this.file_aliases);
		this.folder_keys = Object.keys(this.folders);
		this.folder_alias_keys = Object.keys(this.folder_aliases);

		this.all_files = this.file_keys.concat(this.file_alias_keys);
		this.all_folders = this.folder_keys.concat(this.folder_alias_keys);
	}

	chunkify() {
		var chunk_size = this.contents.length;
		while (!(this.in_line(chunk_size) || chunk_size <= 1)) {
			chunk_size -= 1;
			chunk = this.get_chunk(chunk_size);
		}
		return chunk || [this.contents];
	}

	get_chunk(chunk_size) {
		chunk = [];
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
	}

	load_from_yaml(filename, aliases) {
		alias = alias || false;
		var loaded = yaml.safeLoad(fs.readFileSync(filename, 'utf8'));
		if (!aliases) {
			return loaded;
		}
		for (var key in loaded) {
			loaded[key] = new Symbol(loaded[key]);
		}
		return loaded;
	}

};