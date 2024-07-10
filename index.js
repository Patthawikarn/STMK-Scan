// Logout
document.getElementById('logoutButton').addEventListener('click', () => {
    window.location.href = './index.html';
});

document.addEventListener('DOMContentLoaded', function () {
    const toggleScannerButton = document.getElementById('toggle-scanner');
    const toggleScannerButton2 = document.getElementById('toggle-scanner-2');
    const clearDataButton = document.getElementById('clear-data');
    const saveButton = document.getElementById('save-button');
    const productTableBody = document.querySelector('#productTable tbody');

    const projectNameInput = document.querySelector('.ProjectName input');
    const orderNumberInput = document.querySelector('.OrderNumber input');
    const buildingInput = document.querySelector('.Building input');
    const floorInput = document.querySelector('.Floor input');
    const typeInput = document.querySelector('.Type input');
    const roomInput = document.querySelector('.Room input');
    const noteInput = document.querySelector('.Note input');
    const groupInput = document.querySelector('.Group input');

    const barcodeScanner1 = document.getElementById('barcode-scanner');
    const barcodeScanner2 = document.getElementById('barcode-scanner-2');

    let isScanning = false;
    let isScanning2 = false;
    let codeReader = null;
    let codeReader2 = null;

    toggleScannerButton.addEventListener('click', function () {
        if (isScanning) {
            stopScanner();
        } else {
            startScanner();
        }
    });

    toggleScannerButton2.addEventListener('click', function () {
        if (isScanning2) {
            stopScanner2();
        } else {
            startScanner2();
        }
    });

    clearDataButton.addEventListener('click', function () {
        clearData();
    });

    saveButton.addEventListener('click', function () {
        saveData();
    });

    function startScanner() {
        isScanning = true;
        toggleScannerButton.textContent = 'ปิดสแกนใบรายการส่งสินค้าเข้าคลัง';
        barcodeScanner1.style.display = 'block';
        barcodeScanner2.style.display = 'none';

        codeReader = new ZXing.BrowserBarcodeReader();
        codeReader.decodeFromVideoDevice(null, 'barcode-scanner', (result, err) => {
            if (result) {
                console.log('Scanned barcode:', result.text);
                handleScannedBarcode(result.text);
            }

            if (err && !(err instanceof ZXing.NotFoundException)) {
                console.error(err);
                alert('An error occurred while scanning.');
                stopScanner();
            }
        }).catch(err => {
            console.error('Error initializing ZXing:', err);
            alert('An error occurred while initializing the scanner.');
            stopScanner();
        });
    }

    function startScanner2() {
        isScanning2 = true;
        toggleScannerButton2.textContent = 'ปิดสแกนใบรายการสินค้า';
        barcodeScanner1.style.display = 'none';
        barcodeScanner2.style.display = 'block';

        codeReader2 = new ZXing.BrowserBarcodeReader();
        codeReader2.decodeFromVideoDevice(null, 'barcode-scanner-2', (result, err) => {
            if (result) {
                console.log('Scanned barcode 2:', result.text);
                handleScannedBarcode2(result.text);
            }

            if (err && !(err instanceof ZXing.NotFoundException)) {
                console.error(err);
                alert('An error occurred while scanning.');
                stopScanner2();
            }
        }).catch(err => {
            console.error('Error initializing ZXing:', err);
            alert('An error occurred while initializing the scanner.');
            stopScanner2();
        });
    }

    function stopScanner() {
        isScanning = false;
        toggleScannerButton.textContent = 'ใบรายการส่งสินค้าเข้าคลัง';
        barcodeScanner1.style.display = 'none';
        if (codeReader) {
            codeReader.reset();
        }
    }

    function stopScanner2() {
        isScanning2 = false;
        toggleScannerButton2.textContent = 'ใบรายการสินค้า';
        barcodeScanner2.style.display = 'none';
        if (codeReader2) {
            codeReader2.reset();
        }
    }

    function handleScannedBarcode(code) {
        if (code.includes('-')) {
            checkPackInTableFromAPI(code);
        } else {
            fetchDataFromAPI(code);
        }
    }

    function handleScannedBarcode2(code) {
        const rows = productTableBody.querySelectorAll('tr');
        let found = false;

        rows.forEach(row => {
            const codepackCell = row.querySelector('td:nth-child(5)');
            const siteCheckbox = row.querySelector('.site-checkbox');

            if (codepackCell.textContent.trim() === code) {
                siteCheckbox.checked = true;
                row.classList.add('scanned');
                found = true;
            }
        });

        if (found) {
            alert('สแกนสำเร็จ');
        } else {
            alert('สแกนไม่สำเร็จ กรุณาสแกนใหม่อีกครั้ง');
        }
        updateCounter();
    }

    function fetchDataFromAPI(code) {
        fetch('https://starmark.work/ProductOnsiteAPI/api/onsite/load', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ barcode: code })
        })
            .then(response => response.json())
            .then(data => {
                console.log('Data from API:', data);
                if (data && data.length > 0) {
                    showBarcodeResult(data);
                } else {
                    productTableBody.innerHTML = '';
                    clearInputs();
                    alert('ไม่พบข้อมูลสำหรับบาร์โค้ดที่สแกนเข้ามา');
                }
            })
            .catch(error => {
                console.error('Error fetching data from API:', error);
                alert('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าจาก API โปรดลองอีกครั้ง');
            });
    }

    // ตัวนับจำนวน
    function updateCounter() {
        const totalRows = productTableBody.querySelectorAll('tr').length;
        const checkedRows = productTableBody.querySelectorAll('.site-checkbox:checked').length;
        checkedCount.textContent = checkedRows;
        totalCount.textContent = totalRows;
    }

    productTableBody.addEventListener('change', function (event) {
        if (event.target.classList.contains('site-checkbox')) {
            updateCounter();
        }
    });


    function showBarcodeResult(data) {
        productTableBody.innerHTML = '';
        clearInputs();

        if (data && data.length > 0) {
            for (const row of data) {
                let newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${row.ProductArticle ?? ''}</td>
                    <td>${row.Category ?? ''}</td>
                    <td>${row.PackSeqTotal ?? ''}</td>
                    <td>${row.ProductSeqTotal ?? ''}</td>
                    <td>${row.Codepack ?? ''}</td>
                    <td>${row.IS_By ?? ''}</td>
                    <td><input type="checkbox" class="site-checkbox"></td>
                `;
                productTableBody.appendChild(newRow);
            }

            projectNameInput.value = data[0].ProjectName ?? '';
            orderNumberInput.value = data[0].OrderNumber ?? '';
            buildingInput.value = data[0].Build ?? '';
            floorInput.value = data[0].Floor ?? '';
            typeInput.value = data[0].Type ?? '';
            roomInput.value = data[0].Room ?? '';
            noteInput.value = data[0].Note ?? '';
            groupInput.value = data[0].Category ?? '';

            updateCounter();
        }
    }

    function clearInputs() {
        projectNameInput.value = '';
        orderNumberInput.value = '';
        buildingInput.value = '';
        floorInput.value = '';
        typeInput.value = '';
        roomInput.value = '';
        noteInput.value = '';
        groupInput.value = '';
    }

    function clearData() {
        productTableBody.innerHTML = '';
        clearInputs();
    }

    function saveData() {
        fetch("https://starmark.work/ProductOnsiteAPI/api/onsite/upload", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ /* data to save */ })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Data saved:', data);
            alert('บันทึกข้อมูลเรียบร้อยแล้ว');
        })
        .catch(error => {
            console.error('Error saving data:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        });
    }

    // Scroll to top button
    window.addEventListener('scroll', () => {
        const backToTopButton = document.getElementById('back-to-top');
        if (window.scrollY > 100) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    });

    // Back to top functionality
    document.getElementById('back-to-top').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
