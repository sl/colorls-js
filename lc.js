'use strict';

const fs = require('fs');

const yaml = require('js-yaml');

const colors = require('colors');

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
		return chunk;
	}

	in_line(chunk_size) {
		return !(this.max_widths.reduce((a, b) => a + b, 0) + 6 * chunk_size > this.screen_width);
	}

	display_report() {
		process.stdout.write('\n Found ${this.contents.length} contents in directory '.white);

		process.stdout.write(this.input.blue);

		process.stdout.write('\n\n\tFolders\t\t\t: ${this.count.folders}'.white);
		process.stdout.write('\n\tRecognized files\t: ${this.count.recognized_files}'.white);
		process.stdout.write('\n\tUnrecognized files\t: ${this.count.unrecognized_files}'.white);
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