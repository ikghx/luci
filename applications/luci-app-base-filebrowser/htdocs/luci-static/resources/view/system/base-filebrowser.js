'use strict';
'require view';
'require fs';
'require ui';
'require dom';
'require rpc';

var currentPath = '/';
var sortField = 'name';
var sortDirection = 'asc';

// Helper function to concatenate paths
function joinPath(path, name) {
    return path.endsWith('/') ? path + name : path + '/' + name;
}

return view.extend({
    load: function() {
        return fs.list(currentPath);
    },
    render: function(data) {
        var files = data;
        var self = this; // Preserve context for event listeners

        var viewContainer = E('div', { 'id': 'file-manager-container' }, [
            E('h2', {}, _('File Manager: ') + currentPath),
            E('style', {}, 
                // Styles to hide unnecessary buttons and customize appearance
                '.cbi-button-apply, .cbi-button-reset, .cbi-button-save:not(.custom-save-button) { display: none !important; }' +
                '.cbi-page-actions { background: none !important; border: none !important; padding: 10px 0 !important; margin: 0 !important; }' +
                '.cbi-tabmenu { background: none !important; border: none !important; height: 0 !important; margin: 0 !important; padding: 0 !important; }' +
                // Add border around the scroll area
                '#file-list-container { margin-top: 30px !important; max-height: 400px; overflow: auto; border: 1px solid #ccc; padding: 10px; }' +
                '#content-editor { margin-top: 30px !important; }' +
                // Remove fixed height and allow resizing
                '#editor-container textarea { ' +
                    'min-width: 300px !important; ' + // Minimum width
                    'max-width: 100% !important; ' + // Maximum width (adjust as needed)
                    'min-height: 200px !important; ' + // Minimum height
                    'max-height: 80vh !important; ' +  // Maximum height
                    'resize: both !important; ' +      // Allow resizing in both directions
                    'overflow: auto !important; ' +    // Add scroll when overflowing
                    'font-family: monospace !important; ' + // Monospaced font for better alignment
                    'white-space: pre !important; ' + // Preserve whitespace formatting and prevent line breaks
                    'overflow-x: auto !important; ' + // Add horizontal scroll
                    'word-wrap: normal !important; ' +         // Disable automatic line wrapping
                '}' +
                'th { text-align: left !important; position: relative; border-right: 1px solid #ddd; box-sizing: border-box; padding-right: 30px; }' + // Added padding-right for sort button
                'td { text-align: left !important; border-right: 1px solid #ddd; box-sizing: border-box; }' + // Added border-right for dividing lines
                'tr:hover { background-color: #f0f0f0 !important; }' +
                'thead th { position: sticky; top: 0; background-color: #fff; z-index: 1; }' +
                '.download-button { color: green; cursor: pointer; margin-left: 5px; }' +
                '.delete-button { color: red; cursor: pointer; margin-left: 5px; }' +
                '.symlink { color: green; }' +
                '.action-button { margin-right: 10px; cursor: pointer; }' +
                // Styles for formatting the Size column
                '.size-cell { display: grid; grid-template-columns: 75px 20px; grid-gap: 5px; align-items: center; font-family: monospace; box-sizing: border-box; }' + // Adjusted grid-template-columns
                '.size-number { text-align: right; }' +
                '.size-unit { text-align: right; }' +
                // Set fixed width for the Size column and add spacing between columns
                '.table { table-layout: fixed; width: 100%; border-collapse: collapse; }' + // Added border-collapse for consistent borders
                '.table th:nth-child(3), .table td:nth-child(3) { width: 100px; }' + // Fixed width for the Size column
                '.table th:nth-child(3) + th, .table td:nth-child(3) + td { padding-left: 10px; }' + // Spacing between Size and next column

                /* Styles for resizable columns */
                '.resizer { position: absolute; right: 0; top: 0; width: 8px; height: 100%; cursor: col-resize; user-select: none; }' + // Increased width and full height
                '.resizer::after { content: ""; position: absolute; right: 2px; top: 0; width: 1px; height: 100%; background: #aaa; }' + // Added a visible line
                // Styles for resizable container
                '#file-list-container.resizable { resize: both; overflow: auto; }' +

                /* Styles for sort buttons */
                '.sort-button { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 0; font-size: 12px; }' +
                '.sort-button:focus { outline: none; }'
            ),
            E('div', { 'class': 'cbi-tabcontainer', 'id': 'tab-group' }, [
                E('ul', { 'class': 'cbi-tabmenu' }, [
                    E('li', { 'class': 'cbi-tab cbi-tab-active', 'id': 'tab-filemanager' }, [
                        E('a', { 'href': '#', 'click': this.switchToTab.bind(this, 'filemanager') }, _('File Manager'))
                    ]),
                    E('li', { 'class': 'cbi-tab', 'id': 'tab-editor' }, [
                        E('a', { 'href': '#', 'click': this.switchToTab.bind(this, 'editor') }, _('Editor'))
                    ])
                ]),
                E('div', { 'class': 'cbi-tabcontainer-content' }, [
                    E('div', { 'id': 'content-filemanager', 'class': 'cbi-tab', 'style': 'display:block;' }, [
                        E('div', { 'id': 'file-list-container', 'class': 'resizable' }, [ // Added 'resizable' class
                            E('table', { 'class': 'table', 'id': 'file-table' }, [
                                E('thead', {}, [
                                    E('tr', {}, [
                                        E('th', { 'data-field': 'name' }, [
                                            _('Name'),
                                            E('button', { 'class': 'sort-button', 'data-field': 'name', 'title': 'Sort by Name' }, '↕'),
                                            E('div', { 'class': 'resizer' })
                                        ]),
                                        E('th', { 'data-field': 'type' }, [
                                            _('Type'),
                                            E('button', { 'class': 'sort-button', 'data-field': 'type', 'title': 'Sort by Type' }, '↕'),
                                            E('div', { 'class': 'resizer' })
                                        ]),
                                        E('th', { 'data-field': 'size' }, [
                                            _('Size'),
                                            E('button', { 'class': 'sort-button', 'data-field': 'size', 'title': 'Sort by Size' }, '↕'),
                                            E('div', { 'class': 'resizer' })
                                        ]),
                                        E('th', { 'data-field': 'mtime' }, [
                                            _('Last Modified'),
                                            E('button', { 'class': 'sort-button', 'data-field': 'mtime', 'title': 'Sort by Last Modified' }, '↕'),
                                            E('div', { 'class': 'resizer' })
                                        ]),
                                        E('th', {}, _('Actions')) // No resizer for the Actions column
                                    ])
                                ]),
                                E('tbody', { 'id': 'file-list' })
                            ])
                        ]),
                        E('div', { 'class': 'cbi-page-actions' }, [
                            E('button', { 'class': 'btn action-button', 'click': this.handleUploadClick.bind(this) }, _('Upload file'))
                        ])
                    ]),
                    E('div', { 'id': 'content-editor', 'class': 'cbi-tab', 'style': 'display:none;' }, [
                        E('p', {}, _('Select a file from the list to edit it here.')),
                        E('div', { 'id': 'editor-container' })
                    ])
                ])
            ])
        ]);

        this.loadFileList(currentPath);
        ui.tabs.initTabGroup(viewContainer.lastElementChild.childNodes);

        // Initialize resizable columns after rendering
        this.initResizableColumns();

        // Attach click event listeners for sorting buttons
        var sortButtons = viewContainer.querySelectorAll('.sort-button[data-field]');
        sortButtons.forEach(function(button) {
            button.addEventListener('click', function(event) {
                var field = button.getAttribute('data-field');
                if (field) {
                    self.sortBy(field);
                }
            });
        });

        return viewContainer;
    },
    switchToTab: function(tab) {
        var fileManagerContent = document.getElementById('content-filemanager');
        var editorContent = document.getElementById('content-editor');
        var tabFileManager = document.getElementById('tab-filemanager');
        var tabEditor = document.getElementById('tab-editor');

        if (fileManagerContent && editorContent && tabFileManager && tabEditor) {
            fileManagerContent.style.display = (tab === 'filemanager') ? 'block' : 'none';
            editorContent.style.display = (tab === 'editor') ? 'block' : 'none';
            tabFileManager.className = (tab === 'filemanager') ? 'cbi-tab cbi-tab-active' : 'cbi-tab';
            tabEditor.className = (tab === 'editor') ? 'cbi-tab cbi-tab-active' : 'cbi-tab';
        }
    },
    // Function to handle file upload
    handleUploadClick: function(ev) {
        var self = this;
        // Define the directory path where the file will be uploaded
        var directoryPath = currentPath;

        // Create a file input element
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.display = 'none';

        // Add it to the page
        document.body.appendChild(fileInput);

        // Use a regular function to preserve the context of 'this'
        fileInput.onchange = function(event) {
            var file = event.target.files[0];  // Get the selected file

            if (!file) {
                ui.addNotification(null, E('p', _('No file selected.')), 'error');
                return;
            }

            console.log('Selected file:', file);  // Log the selected file

            // Form the full path for the file
            var fullFilePath = joinPath(directoryPath, file.name);

            // Create a FormData object to send data to the server
            var formData = new FormData();
            formData.append('sessionid', rpc.getSessionID());  // Add the session
            formData.append('filename', fullFilePath);         // Path for upload
            formData.append('filedata', file);                 // The file itself

            console.log('FormData prepared:', formData);  // Log the prepared data

            // Create a progress bar element
            var progress = E('div', { 'class': 'cbi-progressbar', 'title': '0%' }, E('div', { 'style': 'width:0' }));
            ui.showModal(_('Uploading file'), [progress]);  // Show a modal with the progress

            // Send an AJAX request to the server to upload the file
            var xhr = new XMLHttpRequest();
            xhr.open('POST', L.env.cgi_base + '/cgi-upload', true);  // Set the upload URL

            // Handle upload progress
            xhr.upload.onprogress = function(event) {
                if (event.lengthComputable) {
                    var percent = (event.loaded / event.total) * 100;
                    progress.setAttribute('title', percent.toFixed(2) + '%');
                    progress.firstElementChild.style.width = percent.toFixed(2) + '%';
                    console.log('Upload progress:', percent + '%');  // Log upload progress
                }
            };

            // Handle upload completion
            xhr.onload = function() {
                ui.hideModal();  // Hide the modal
                if (xhr.status === 200) {
                    console.log('Upload successful:', xhr.responseText);  // Log successful response
                    ui.addNotification(null, E('p', _('File uploaded successfully.')), 'info');
                    self.loadFileList(currentPath);  // Refresh the file list
                } else {
                    console.log('Upload failed with status:', xhr.status);  // Log error status
                    ui.addNotification(null, E('p', _('Upload failed: ') + xhr.statusText), 'error');
                }
            };

            // Handle upload errors
            xhr.onerror = function() {
                ui.hideModal();
                console.log('Network error during upload');  // Log network error
                ui.addNotification(null, E('p', _('Upload failed due to a network error.')), 'error');
            };

            // Send the data
            xhr.send(formData);
            console.log('Upload started');  // Log upload start
        };

        // Programmatically trigger the file selection dialog
        fileInput.click();
    },

    // Function to load the file list in the specified directory
    loadFileList: function(path) {
        var self = this;
        fs.list(path).then(function(files) {
            var fileList = document.getElementById('file-list');
            if (!fileList) {
                ui.addNotification(null, E('p', _('Failed to find the file list container.')), 'error');
                return;
            }
            fileList.innerHTML = '';
            files.sort(self.compareFiles.bind(self));

            if (path !== '/') {
                var parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
                var listItemUp = E('tr', {}, [
                    E('td', { colspan: 5 }, [
                        E('a', { 'href': '#', 'click': function() { self.handleDirectoryClick(parentPath); } }, _('←(Parent Directory)'))
                    ])
                ]);
                fileList.appendChild(listItemUp);
            }

            files.forEach(function(file) {
                var listItem;
                var displaySize = (file.type === 'directory') ? '-' : self.formatFileSize(file.size);
                if (file.type === 'directory') {
                    listItem = E('tr', {}, [
                        E('td', {}, [
                            E('a', {
                                'href': '#',
                                'style': 'color:blue;',
                                'click': function() {
                                    self.handleDirectoryClick(joinPath(path, file.name));
                                }
                            }, file.name)
                        ]),
                        E('td', {}, _('Directory')),
                        E('td', { 'class': 'size-cell' }, [
                            E('span', { 'class': 'size-number' }, '-'),
                            E('span', { 'class': 'size-unit' }, '')
                        ]),
                        E('td', {}, new Date(file.mtime * 1000).toLocaleString()),
                        E('td', {}, [
                            E('span', { 'class': 'delete-button', 'click': function() { self.handleDeleteFile(joinPath(path, file.name)); } }, '🗑️')
                        ])
                    ]);
                } else if (file.type === 'file') {
                    listItem = E('tr', {}, [
                        E('td', {}, [
                            E('a', {
                                'href': '#',
                                'style': 'color:black;',
                                'click': function() {
                                    self.handleFileClick(joinPath(path, file.name));
                                }
                            }, file.name)
                        ]),
                        E('td', {}, _('File')),
                        E('td', { 'class': 'size-cell' }, [
                            E('span', { 'class': 'size-number' }, self.getNumericSize(file.size)),
                            E('span', { 'class': 'size-unit' }, self.getSizeUnit(file.size))
                        ]),
                        E('td', {}, new Date(file.mtime * 1000).toLocaleString()),
                        E('td', {}, [
                            E('span', { 'class': 'delete-button', 'click': function() { self.handleDeleteFile(joinPath(path, file.name)); } }, '🗑️'),
                            E('span', { 'class': 'download-button', 'click': function() { self.handleDownloadFile(joinPath(path, file.name)); } }, '⬇️')
                        ])
                    ]);
                }
                fileList.appendChild(listItem);
            });
        }).catch(function(err) {
            ui.addNotification(null, E('p', _('Failed to load file list: %s').format(err.message)), 'error');
        });
    },
    // Functions to separate numeric part and units
    getNumericSize: function(size) {
        if (size === undefined || size === null) return '0.0';
        if (size === -1) return '-';
        if (size === 0) return '0.0';
        var i = Math.floor(Math.log(size) / Math.log(1024));
        if (i < 0) i = 0;
        var num = (size / Math.pow(1024, i)).toFixed(1);
        return num;
    },
    getSizeUnit: function(size) {
        if (size === undefined || size === null) return '';
        if (size === -1) return '';
        var units = ['B', 'kB', 'MB', 'GB', 'TB'];
        var i = Math.floor(Math.log(size) / Math.log(1024));
        if (i < 0) i = 0;
        return units[i];
    },
    formatFileSize: function(size) {
        if (size === undefined || size === null) return '-';
        if (size === -1) return '-';
        if (size === 0) return '0.0B';
        var i = Math.floor(Math.log(size) / Math.log(1024));
        if (i < 0) i = 0;
        var num = (size / Math.pow(1024, i)).toFixed(1);
        return num + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    },
    sortBy: function(field) {
        if (sortField === field) {
            sortDirection = (sortDirection === 'asc') ? 'desc' : 'asc';
        } else {
            sortField = field;
            sortDirection = 'asc';
        }
        this.loadFileList(currentPath);
    },
    compareFiles: function(a, b) {
        var valueA = a[sortField] || '';
        var valueB = b[sortField] || '';
        if (sortField === 'name') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }
        if (sortField === 'size') {
            // When sorting by size, directories have size -1
            valueA = (a.type === 'directory') ? -1 : a.size;
            valueB = (b.type === 'directory') ? -1 : b.size;
        }
        if (sortDirection === 'asc') {
            return (valueA > valueB) ? 1 : ((valueA < valueB) ? -1 : 0);
        } else {
            return (valueA < valueB) ? 1 : ((valueA > valueB) ? -1 : 0);
        }
    },
    handleDirectoryClick: function(newPath) {
        currentPath = newPath || '/';
        var header = document.querySelector('h2');
        if (header) {
            header.textContent = _('File Manager: ') + currentPath;
        }
        this.loadFileList(currentPath);
    },
    handleFileClick: function(filePath) {
        var self = this;
        fs.read(filePath).then(function(content) {
            var editorContainer = document.getElementById('editor-container');
            if (!editorContainer) {
                ui.addNotification(null, E('p', _('Editor container not found.')), 'error');
                return;
            }
            editorContainer.innerHTML = '';
            var editor = E('div', {}, [
                E('h3', {}, _('Editing: ') + filePath),
                E('textarea', { 
                    'wrap': 'off', // Disable line wrapping
                    'style': 'width:100%;', 
                    'rows': 20 
                }, [content != null ? content : '']),
                E('div', { 'class': 'cbi-page-actions' }, [
                    E('button', { 
                        'class': 'btn cbi-button-save custom-save-button', 
                        'click': function() { self.handleSaveFile(filePath); } 
                    }, _('Save'))
                ])
            ]);
            editorContainer.appendChild(editor);
            self.switchToTab('editor');
        }).catch(function(err) {
            ui.addNotification(null, E('p', _('Failed to open file: %s').format(err.message)), 'error');
        });
    },
    handleDownloadFile: function(filePath) {
        var self = this;
        fs.read(filePath).then(function(content) {
            var blob = new Blob([content], { type: 'application/octet-stream' });
            var downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = filePath.split('/').pop();
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }).catch(function(err) {
            ui.addNotification(null, E('p', _('Failed to download file: %s').format(err.message)), 'error');
        });
    },
    handleDeleteFile: function(filePath) {
        var self = this;
        if (confirm(_('Are you sure you want to delete this file or directory?'))) {
            fs.remove(filePath).then(function() {
                ui.addNotification(null, E('p', _('File or directory deleted successfully.')), 'info');
                self.loadFileList(currentPath);
            }).catch(function(err) {
                ui.addNotification(null, E('p', _('Failed to delete file or directory: %s').format(err.message)), 'error');
            });
        }
    },
    handleSaveFile: function(filePath) {
        var self = this;
        var textarea = document.querySelector('#editor-container textarea');
        if (!textarea) {
            ui.addNotification(null, E('p', _('Editor textarea not found.')), 'error');
            return;
        }
        var content = textarea.value;
        fs.write(filePath, content).then(function() {
            ui.addNotification(null, E('p', _('File saved successfully.')), 'info');
            self.loadFileList(currentPath);
        }).catch(function(err) {
            ui.addNotification(null, E('p', _('Failed to save file: %s').format(err.message)), 'error');
        });
    },
    // Initialize resizable columns
    initResizableColumns: function() {
        var self = this;
        var table = document.getElementById('file-table');
        if (!table) {
            console.log('Table not found for resizable columns.');
            return;
        }
        var headers = table.querySelectorAll('th');
        for (var i = 0; i < headers.length; i++) {
            (function(index) {
                var header = headers[index];
                var resizer = header.querySelector('.resizer');
                if (resizer) {
                    resizer.addEventListener('mousedown', initDrag, false);
                }

                function initDrag(e) {
                    e.preventDefault();
                    var startX = e.pageX;
                    var startWidth = header.offsetWidth;

                    function doDrag(e) {
                        var newWidth = startWidth + (e.pageX - startX);
                        if (newWidth > 50) { // Minimum column width
                            header.style.width = newWidth + 'px';
                            // Also set the corresponding cells to the same width
                            var rows = table.querySelectorAll('tr');
                            for (var j = 0; j < rows.length; j++) {
                                var cell = rows[j].children[index];
                                if (cell) {
                                    cell.style.width = newWidth + 'px';
                                }
                            }
                        }
                    }

                    function stopDrag() {
                        document.removeEventListener('mousemove', doDrag, false);
                        document.removeEventListener('mouseup', stopDrag, false);
                    }

                    document.addEventListener('mousemove', doDrag, false);
                    document.addEventListener('mouseup', stopDrag, false);
                }
            })(i);
        }
    }
});
