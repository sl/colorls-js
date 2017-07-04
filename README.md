# Color LS 

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=shields)](http://makeapullrequest.com)

A node app that colorizes the `ls` output with color and icons.

Screenshots taken from original repository for the ruby version, but the output should be the same in the javascript version.

![Example #1](readme/usage1.png)

# How to use

- Just `lc` : Prints all directories, files and dotfiles in current directory.

  ![Usage #1](readme/usage1.png)

- With paths : `lc path(s)` prints all directories, files and dotfiles in given directory / directories.

  ![Usage #2](readme/usage2.png)

- With `--report` or `-r` flag : `lc path(s) -r` : Prints all directories, files and dotfiles in directories, along with a brief report about number of files and folders shown.

  ![Usage #3](readme/usage3.png)
  ![Usage #4](readme/usage4.png)

# Installation steps

Note: The package is not currently on the NPM registry. Until it is, you will need to install via the second listed method.

This readme will be updated once the package is released.

1. Install Node and npm.
2. Install the patched fonts of powerline nerd-font and/or font-awesome.
3. `npm install -g colorls-js`


You can also install by cloning the repository, and running:

`npm install -g`

from the project directory.

_NOTE: If you're iTerm2 on Mac, you may have to enable the nerd-font at iTerm2 > Preferences > Profiles > Text > Non-Ascii font > Knack Regular Nerd Font Complete_

# Tweaking this project

![Pending formats](readme/pending.png)

Feel free to clean up any parts of the project. This is a port of the original, so any changes made there will have to be ported, and any help with the port is appreciated!

# LICENSE

MIT License 2017 - [Athitya Kumar](https://github.com/athityakumar/).