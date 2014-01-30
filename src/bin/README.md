# Builder #
Assemble your own production script using only the components you need.

## Requirements ##
* Nodejs
* npm

## First run ##
Execute `npm install` or run `install-unix.sh` if you are running Unix/MacOS or `install-win.bat` if you are using Windows.

## Setup ##
Edit `build.json`

```
{
    "output":	"../build",
	"filename":	"jform.js",
	"files":	[
		"../src/js/core.js",
		"../src/js/modules/*.js"
	]
}
```

`output` The output directory for the files

`filename` The output filename. `.dev` and `.min` will be added in the filename.

`files` An array of files indicating which files to use to build the script. Add/Remove files to select which components you'll need. You can use a wildcard `*` before a file extention to include all of the directory's files having that extentions.

## Build ##
Execute `node build.js` or run `build-unix.sh` if you are running Unix/MacOS or `build-win.bat` if you are using Windows.

## About ##
The builder script was built by Julien Loutre for Twenty-Six Medias, Inc.

## License ##
Copyright (c) < 2014 > < Twenty-Six Medias, Inc >

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.