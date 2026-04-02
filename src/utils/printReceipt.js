import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { maskPhoneNumber, formatCurrency } from '../lib/utils';

export const printReceipt = async (businessEntry) => {
    try {
        let receiptData = null;

        // Try getting existing receipts first
        const getRes = await axiosInstance.get(`/investments/${businessEntry.id}/receipts`);
        if (getRes.data?.data && getRes.data.data.length > 0) {
            receiptData = getRes.data.data[0];
        } else {
            // If doesn't exist, create it
            const postRes = await axiosInstance.post(`/receipts`, {
                investment_id: businessEntry.id,
                amount: businessEntry.investment_amount
            });
            receiptData = postRes.data?.data;
        }

        if (!receiptData && !businessEntry.receipt_number) throw new Error("Failed to load receipt data");

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Please allow popups to print the receipt.');
            return;
        }

        const customerInfo = businessEntry.customer || {};
        const beneficiaryInfo = businessEntry.beneficiary || {};
        const investmentProduct = businessEntry.investment_product || {};
        const branch = businessEntry.branch || {};
        const phoneNo = customerInfo.phone_primary || customerInfo.phone || customerInfo.contact_number || businessEntry.phone_primary || businessEntry.contact_number || 'N/A';
        const addressParts = [
            customerInfo.address_line_1 || customerInfo.address_line1 || businessEntry.address_line_1 || businessEntry.address_line1 || '',
            customerInfo.address_line_2 || customerInfo.address_line2 || businessEntry.address_line_2 || businessEntry.address_line2 || '',
            customerInfo.city || businessEntry.city || ''
        ].filter(part => part && String(part).trim() !== '');
        const address = addressParts.length > 0 ? addressParts.join(', ') : (customerInfo.address || businessEntry.address || 'N/A');
        const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const receiptDate = receiptData?.created_at
            ? new Date(receiptData.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : formattedDate;

        const appNumParts = businessEntry.application_number?.split('-');
        const formattedAgreementNo = appNumParts && appNumParts.length >= 3
            ? `CDP/${appNumParts[1]}/${appNumParts.slice(2).join('-')}`
            : `CDP/ ________ / ${businessEntry.application_number?.split('-')?.pop() || 'N/A'}`;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - ${receiptData.receipt_number || 'Pending'}</title>
                <script src="https://unpkg.com/lucide@latest"></script>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    body {
                        font-family: 'Oswald', sans-serif;
                        color: #000;
                        line-height: 1.5;
                        margin: 0;
                        padding: 0;
                        background-color: #e5e5e5; /* Light gray background */
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    @page {
                        size: landscape;
                        margin: 0;
                    }
                    
                    .page {
                        padding: 15px 30px 15px 30px; /* Further reduced padding */
                        width: 100%;
                        height: 100vh; /* Force exactly one page */
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        box-sizing: border-box;
                        overflow: hidden;
                    }
                    
                    .watermark {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        opacity: 0.15;
                        pointer-events: none;
                        width: 60%;
                        max-width: 600px;
                        z-index: 0;
                    }

                    .content-wrapper {
                        position: relative;
                        z-index: 1;
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                        justify-content: space-between;
                    }
                    
                    /* Header Area */
                    .header {
                        display: flex;
                        flex-direction: column;
                        margin-bottom: 0px; /* Removed bottom margin */
                    }
                    
                    .header-top {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        width: 100%;
                    }

                    .logo {
                        width: 220px;
                        height: auto;
                        display: block;
                        margin-top: -65px; /* Pull up aggressively into bounding box */
                        margin-left: -45px; 
                        margin-bottom: -40px; /* Pull elements below it up into the logo's internal padding */
                    }

                    .company-info {
                        font-family: 'Oswald', sans-serif;
                        font-size: 11px;
                        font-weight: 500;
                        line-height: 1.3;
                        z-index: 10; /* Ensure text sits on top of any logo padding */
                        position: relative;
                        margin-top: 0px;
                    }

                    .company-email {
                        color: #A01F29; /* Maroon red */
                        font-weight: 700;
                    }

                    .pv-number {
                        font-family: 'Oswald', sans-serif;
                        font-size: 18px;
                        font-weight: 500;
                        letter-spacing: 2px;
                        margin-top: -15px; /* Pull PV Number up into the blue box */
                    }

                    /* Main Layout */
                    .main-content {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 5px; 
                        flex: 1;
                        padding-right: 20px;
                    }

                    .left-col {
                        width: 50%;
                    }

                    .right-col {
                        width: 45%;
                        padding-top: 0px; /* Removed 80px offset to pull Customer Details up into orange box */
                    }

                    /* Typography */
                    .section-title {
                        color: #A01F29; /* Maroon red */
                        font-size: 16px; /* Reduced from 20 */
                        font-weight: 600;
                        margin: 0 0 6px 0;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }

                    .main-title {
                        font-size: 20px; /* Reduced from 24 */
                        font-weight: 700;
                        margin-bottom: 15px;
                    }

                    .field-row {
                        display: flex;
                        align-items: flex-start;
                        margin-bottom: 8px; /* Reduced from 12 */
                        font-size: 13px; /* Reduced from 14 */
                        font-weight: 500;
                        letter-spacing: 0.8px; /* Increased for readability */
                    }

                    .field-label {
                        width: 160px;
                        flex-shrink: 0;
                    }

                    .field-value {
                        flex: 1;
                    }

                    /* Specific block spacing */
                    .receipt-block {
                        margin-bottom: 20px;
                    }

                    .agreement-block {
                        margin-bottom: 20px;
                    }

                    .payment-block {
                        margin-bottom: 20px;
                    }

                    .customer-block {
                        margin-bottom: 30px;
                    }

                    .official-block {
                        margin-bottom: 20px;
                    }

                    /* Dividers & Signatures */
                    .signature-line {
                        display: inline-block;
                        border-bottom: 1px dashed #000;
                        width: 150px;
                        margin-left: 5px;
                    }
                    
                    .date-line {
                        display: inline-block;
                        border-bottom: 1px solid #000;
                        width: 30px;
                        margin: 0 2px;
                    }

                    /* Footer Buttons Area */
                    .footer-buttons {
                        display: flex;
                        justify-content: center;
                        gap: 20px;
                        margin-top: -30px; /* Pull buttons up closer to the content above */
                    }

                    .btn {
                        background: linear-gradient(to bottom, #f3f4f6, #9ca3af);
                        border: 1px dashed #4b5563;
                        border-radius: 12px;
                        padding: 8px 15px; /* Reduced padding */
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        min-width: 140px; /* Reduced min-width */
                        position: relative;
                        box-shadow: inset 0px 2px 4px rgba(255,255,255,0.7), 0px 4px 6px rgba(0,0,0,0.15);
                    }

                    .btn-title {
                        font-family: inherit;
                        font-size: 16px;
                        font-weight: 700;
                        color: #1e3a8a; /* Dark blue */
                        margin-bottom: 2px;
                    }

                    .btn-content {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        font-size: 13px;
                        font-weight: 700;
                    }

                    .btn-red-text {
                        color: #dc2626; /* Bright Red */
                    }
                    
                    .btn-icon {
                        position: absolute;
                        right: 15px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 24px;
                        height: 24px;
                    }

                    /* Bottom Disclaimers */
                    .disclaimer {
                        text-align: center;
                        font-size: 11px;
                        font-weight: 500;
                        margin-top: 25px;
                        line-height: 1.6;
                        color: #000;
                        font-family: 'Oswald', sans-serif;
                    }
                    
                    /* Italics for specific paragraphs */
                    .disclaimer p {
                        margin: 4px 0;
                    }
                </style>
            </head>
            <body>
                <div class="page">
                    <img src="/logo_no_white.png" class="watermark" />
                    
                    <div class="content-wrapper">
                        <!-- Header -->
                        <div class="header">
                            <div class="header-top">
                                <img src="/logo_no_white.png" alt="Ceylon Development Plantation" class="logo" />
                                <div class="pv-number">
                                    PV00345763
                                </div>
                            </div>
                            <div class="company-info">
                                <div class="company-email">info@cdp.lk</div>
                                <div>No. 82-B/1,</div>
                                <div>Bauddhaloka Mawatha,</div>
                                <div>Colombo 04</div>
                            </div>
                        </div>

                        <!-- 2-Column Main Content -->
                        <div class="main-content">
                            <!-- Left Column -->
                            <div class="left-col">
                                <div class="receipt-block">
                                    <h1 class="section-title main-title">RECEIPT</h1>
                                    <div class="field-row">
                                        <div class="field-label">Receipt No:</div>
                                        <div class="field-value" style="font-weight: 700;">${receiptData.receipt_number || 'N/A'}</div>
                                    </div>
                                    <div class="field-row">
                                        <div class="field-label">Date:</div>
                                        <div class="field-value">${receiptDate}</div>
                                    </div>
                                </div>

                                <div class="agreement-block">
                                    <h2 class="section-title">AGREEMENT INFORMATION</h2>
                                    <div class="field-row">
                                        <div class="field-label">Agreement No:</div>
                                        <div class="field-value" style="font-weight: 700;">${formattedAgreementNo}</div>
                                    </div>
                                </div>

                                <div class="payment-block">
                                    <h2 class="section-title">PAYMENT DETAILS</h2>
                                    <div class="field-row">
                                        <div class="field-label">Amount in Words:</div>
                                        <div class="field-value" style="text-transform: capitalize;">${receiptData.amount_in_words || 'N/A'} Rupees Only</div>
                                    </div>
                                    <div class="field-row mt-4" style="margin-top: 15px;">
                                        <div class="field-label">Amount Received (Rs):</div>
                                        <div class="field-value" style="font-weight: 700;">${formatCurrency(receiptData.amount || businessEntry.investment_amount)}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Right Column -->
                            <div class="right-col">
                                <div class="customer-block">
                                    <div class="field-row" style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
                                        Customer Details
                                    </div>
                                    <div class="field-row">
                                        <div class="field-label" style="width: 100px;">Name:</div>
                                        <div class="field-value" style="font-weight: 700;">${customerInfo.full_name || businessEntry.full_name || 'N/A'}</div>
                                    </div>
                                    <div class="field-row">
                                        <div class="field-label" style="width: 100px;">Address:</div>
                                        <div class="field-value" style="font-weight: 700;">${address}</div>
                                    </div>
                                    <div class="field-row mt-4" style="margin-top: 15px;">
                                        <div class="field-label" style="width: 100px;">Contact No:</div>
                                        <div class="field-value" style="font-weight: 700;">${maskPhoneNumber(phoneNo)}</div>
                                    </div>
                                </div>

                                <div class="official-block">
                                    <h2 class="section-title" style="font-size: 16px; margin-bottom: 15px;">OFFICIAL USE ONLY</h2>
                                    <div class="field-row">
                                        <div class="field-label" style="width: 120px;">Branch Name:</div>
                                        <div class="field-value" style="font-weight: 700;">${branch.name || 'Head Office'}</div>
                                    </div>
                                    
                                    <div class="field-row" style="margin-top: 15px; align-items: center;">
                                        <div class="field-label" style="width: 120px;">Officer Signature:</div>
                                        <div class="field-value"></div>
                                    </div>

                                    <div class="field-row" style="margin-top: 15px; align-items: center;">
                                        <div class="field-label" style="width: 40px;">Date:</div>
                                        <div class="field-value" style="font-weight: 700;">
                                            ${formattedDate}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Footer Area (Buttons & Disclaimer) -->
                        <div>
                            <div class="footer-buttons">
                                <div class="btn">
                                    <div class="btn-title">Help Line</div>
                                    <div class="btn-content">
                                        <i data-lucide="headset" style="width: 16px; height: 16px; color:#000;"></i>
                                        <span class="btn-red-text">114007007</span>
                                    </div>
                                </div>
                                <div class="btn">
                                    <div class="btn-title">Pay <span class="btn-red-text">Online</span></div>
                                    <div class="btn-content" style="color: #000;">
                                        info@cdp.lk
                                    </div>
                                    <div class="btn-icon">
                                        <i data-lucide="user-round" stroke-width="2.5" style="width: 24px; height: 24px; color:#000;"></i>
                                    </div>
                                </div>
                            </div>

                            <div class="disclaimer">
                                <p style="font-family: inherit;">If payment been made at any of our branch offices. the date of collection will be the date of receipt issued by that office. If the payment is made by cheque, this receipt is valid only upon due of the cheque</p>
                                <p style="font-family: inherit;">Stamp Duty has been computed in terms of the Stamp Duty Act No. 12 of 2006.</p>
                            </div>
                        </div>

                    </div>
                </div>
                
                <script>
                    setTimeout(() => {
                        if (typeof lucide !== 'undefined') {
                            lucide.createIcons();
                        }
                        window.print();
                    }, 500);
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    } catch (error) {
        console.error("Failed to print receipt:", error);
        const errorMessage = error.response?.data?.message || error.message || "Unable to generate receipt at this time.";
        toast.error(errorMessage);
    }
}
