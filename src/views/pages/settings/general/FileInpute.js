import React, { useState } from 'react';

const FileInput = ({ onChange }) => {
    const [base64textString, setBase64textString] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0] || null;
        onChange(selectedFile);
    };

    const onFileSelected = (event) => {
        handleFileSelect(event);

        if (event.target.files && event.target.files[0]) {
            let fileSize = event.target.files[0].size; // in bytes
            let maxSize = "1500000"; // 1.5 MB
            if (fileSize > maxSize) {
                alert('Sorry, you cannot upload an image larger than ' + parseInt(maxSize) / 1000000 + ' MB');
                setTimeout(() => {
                    setImageUrl("");
                }, 500);
                return false;
            } else {
                var reader = new FileReader();

                reader.readAsDataURL(event.target.files[0]); // read file as data url

                reader.onload = (event) => {
                    setImageUrl(event.target.result);
                };
            }
        }
    };

    const handleFileSelect = (evt) => {
        var files = evt.target.files;
        var file = files[0];

        if (files && file) {
            var reader = new FileReader();

            reader.onload = handleReaderLoaded.bind(evt);

            reader.readAsBinaryString(file);
        }
    };

    const handleReaderLoaded = (readerEvt) => {
        var binaryString = readerEvt.target.result;
        setBase64textString(btoa(binaryString));
        setImageUrl('data:image/png;base64,' + btoa(binaryString));
        console.log(imageUrl);
        onChange(imageUrl);
        return imageUrl;
    };

    return (
        <div className="mt-4 w-full">
            <div className='flex flex-1 items-center justify-center'>
                <div className="grid grid-cols-1">
                    <div className="items-center" style={{ maxWidth: '200px' }}>
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt="Preview"
                                style={{ width: '250px', height: '150px', objectFit: 'contain', marginBottom: '12px' }}
                            />
                        )}
                    </div>
                    <div className="mt-1 cursor-pointer">
                        <input
                            type="file"
                            onChange={onFileSelected}
                            className="py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileInput;