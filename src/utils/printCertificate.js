import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import logoSealImg from '../assets/logo_seal.png';
import { formatCurrency } from '../lib/utils';

export const printCertificate = async (businessEntry) => {
    try {
        const getRes = await axiosInstance.get(`/investments/${businessEntry.id}/certificate`);
        const certData = getRes.data?.data;

        if (!certData) throw new Error("Failed to load certificate data");

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Please allow popups to print the certificate.');
            return;
        }

        const customerInfo = certData.customer || businessEntry.customer || {};
        const investmentProduct = certData.investment_product || businessEntry.investment_product || {};
        const beneficiaryInfo = certData.beneficiary || businessEntry.beneficiary || {};
        const branch = certData.branch || businessEntry.branch || {};

        const phoneNo = customerInfo.phone_primary || customerInfo.phone || customerInfo.contact_number || businessEntry.phone_primary || businessEntry.contact_number || 'N/A';
        const addressParts = [
            customerInfo.address_line_1 || customerInfo.address_line1 || certData.customer?.address_line_1 || certData.customer?.address_line1 || businessEntry.address_line_1 || businessEntry.address_line1 || '',
            customerInfo.address_line_2 || customerInfo.address_line2 || certData.customer?.address_line_2 || certData.customer?.address_line2 || businessEntry.address_line_2 || businessEntry.address_line2 || '',
            customerInfo.city || certData.customer?.city || businessEntry.city || ''
        ].filter(part => part && String(part).trim() !== '');
        const address = addressParts.length > 0 ? addressParts.join(', ') : (customerInfo.address || businessEntry.address || 'N/A');
        const nicNo = customerInfo.id_number || businessEntry.id_number || 'N/A';

        const invAmount = Number(certData.investment_amount || businessEntry.investment_amount || 0);
        const termMonths = investmentProduct.duration_months || 0;


        // ROI Breakdown & Totals
        const maturity_amount = Number(certData.maturity_amount || businessEntry.maturity_amount || 0);
        const total_interest = Number(certData.total_interest || businessEntry.total_interest || 0);
        const monthly_return = Number(certData.monthly_return || businessEntry.monthly_return || businessEntry.monthly_profit || 0);

        const monthlyHarvest = monthly_return || (total_interest / (termMonths || 1)) || (invAmount * (investmentProduct.profit_percentage || 0) / 100);
        const annualHarvest = Number(certData.annual_return || certData.year_1_breakdown || (monthlyHarvest * 12));
        const totalHarvest = total_interest || (monthlyHarvest * termMonths);
        const netGuaranteed = maturity_amount || (invAmount + totalHarvest);

        // Build Breakdown Table Rows
        let breakdownRows = '';
        const year1 = Number(certData.year_1_breakdown || 0);
        const year2 = Number(certData.year_2_breakdown || 0);
        const year3 = Number(certData.year_3_breakdown || 0);
        const year4 = Number(certData.year_4_breakdown || 0);
        const year5 = Number(certData.year_5_breakdown || 0);
        const month6 = Number(certData.month_6_breakdown || 0);

        if (year1 > 0) {
            const years = [year1, year2, year3, year4, year5];
            years.forEach((annual, idx) => {
                if (annual > 0) {
                    breakdownRows += `
                        <tr>
                            <td style="text-align: center;">${idx + 1}</td>
                            <td>${formatCurrency(invAmount)}</td>
                            <td>${formatCurrency(annual / 12)}</td>
                            <td>${formatCurrency(annual)}</td>
                            <td style="background: #e5e5e5; border-bottom: none;"></td>
                        </tr>
                    `;
                }
            });
        } else if (month6 > 0) {
            breakdownRows += `
                <tr>
                    <td style="text-align: center;">6 Months</td>
                    <td>${formatCurrency(invAmount)}</td>
                    <td>${formatCurrency(monthly_return || (month6 / 6))}</td>
                    <td>${formatCurrency(month6)}</td>
                    <td style="background: #e5e5e5; border-bottom: none;"></td>
                </tr>
            `;
        } else {
            breakdownRows += `
                <tr>
                    <td style="text-align: center;">1</td>
                    <td>${formatCurrency(invAmount)}</td>
                    <td>${formatCurrency(monthlyHarvest)}</td>
                    <td>${formatCurrency(annualHarvest)}</td>
                    <td style="background: #e5e5e5; border-bottom: none;"></td>
                </tr>
            `;
        }

        // Extract names carefully with placeholders
        const nameWithInitials = customerInfo.new_name_with_initials || customerInfo.name_with_initials || customerInfo.full_name || '';
        const beneficiaryName = beneficiaryInfo.full_name || beneficiaryInfo.name || certData.beneficiary_name || businessEntry.beneficiary_name || '';
        const beneficiaryNIC = beneficiaryInfo.nic || beneficiaryInfo.id_number || certData.beneficiary_nic || businessEntry.beneficiary_nic || '';

        // Formatted dates - Use approved_at or initial_payment_date as priority for commencement
        const commencementDateRaw = certData.approved_at || certData.initial_payment_date || certData.commencement_date || businessEntry.start_date || businessEntry.created_at;
        const commencementDate = commencementDateRaw ? new Date(commencementDateRaw).toLocaleDateString('en-GB') : 'N/A';

        // Compute termination date
        let terminationDate = 'N/A';
        if (commencementDateRaw && termMonths) {
            let d = new Date(commencementDateRaw);
            d.setMonth(d.getMonth() + Number(termMonths));
            terminationDate = d.toLocaleDateString('en-GB');
        }

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Certificate - ${certData.policy_number || businessEntry.policy_number || 'Pending'}</title>
                <script src="https://unpkg.com/lucide@latest"></script>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Serif:wght@700;900&display=swap" rel="stylesheet">
                
                <style>
                    body { margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: white; }
                    @page { size: A4 portrait; margin: 0; }
                    * { box-sizing: border-box; }
                    .page { width: 100%; height: 100vh; position: relative; overflow: hidden; page-break-after: always; background: white; }
                    
                    /* PAGE 1 STYLES */
                    .p1-frame { position: absolute; top: 25px; left: 25px; right: 25px; bottom: 25px; border: 1px solid #01562B; }
                    .p1-inner-frame { position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border: 2px solid #01562B; }
                    /* Force green band over all edges */
                    .green-band { position: absolute; top: -100px; bottom: -100px; right: 70px; width: 140px; background-color: #01562B; z-index: 2; }
                    
                    .badge-container {
                        position: absolute; right: 45px; top: 110px; width: 190px; height: 190px; z-index: 5;
                        display: flex; justify-content: center; align-items: center;
                    }
                    .seal-wrapper {
                        position: relative; width: 190px; height: 190px;
                        display: flex; justify-content: center; align-items: center; z-index: 10;
                    }
                    .unified-seal {
                        width: 170px; /* Reduced from 190 to fit cleanly above ribbons */
                        height: auto;
                        z-index: 11;
                        object-fit: contain;
                        position: relative;
                    }
                    
                    .p1-content { position: absolute; top: 90px; left: 80px; right: 280px; z-index: 3; max-width: 500px; }
                    .p1-title { font-family: 'Inter', sans-serif; color: #01562B; font-size: 44px; font-weight: 900; line-height: 1.15; margin: 0; letter-spacing: -0.5px; }
                    .dec-line-container { margin-top: 20px; display: flex; align-items: center; }
                    .dec-line-bar { width: 3px; height: 14px; background: #01562B; }
                    .dec-line-horiz { height: 2px; width: 80px; background: #01562B; }
                    .client-schedule-txt { font-family: 'Inter', sans-serif; margin-top: 5px; font-size: 19px; font-weight: 700; letter-spacing: 1.5px; color: #000; }
                    
                    .customer-area { margin-top: 45px; }
                    .customer-name { font-family: 'Inter', sans-serif; font-size: 52px; font-weight: 500; margin: 0; color: #000; line-height: 1.1; display: inline-block; max-width: 100%; word-wrap: break-word; }
                    .award-text { font-family: 'Inter', sans-serif; margin-top: 50px; font-size: 15px; line-height: 1.6; font-weight: 500; color: #000; width: 100%; max-width: 480px; text-align: justify; }
                    
                    .p1-footer { position: absolute; bottom: 150px; left: 80px; z-index: 3; }
                    .address-text { font-family: 'Inter', sans-serif; margin: 0; font-size: 14px; width: 400px; line-height: 1.5; }
                    
                    .arrow-divider { margin-top: 15px; display: flex; align-items: center; color: #01562B; width: 400px; }
                    .arrow-line { height: 2px; background: #01562B; flex: 1; margin: 0 4px; }
                    
                    .phone-block { margin-top: 15px; display: flex; align-items: center; font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 800; color: #000; }
                    .phone-icon { margin-right: 10px; }
                    
                    /* PAGE 2 STYLES */
                    .p2-top-blob-left { position: absolute; top: 0; left: 0; width: 140px; height: 80px; background-color: #01562B; border-bottom-right-radius: 90px; z-index: 10; }
                    .p2-top-blob-right { position: absolute; top: 0; right: 0; width: 70px; height: 100px; background-color: #7b8e62; border-bottom-left-radius: 90px; z-index: 10; opacity: 0.8; }
                    .p2-top-blob-right-inner { position: absolute; top: 0; right: 0; width: 50px; height: 80px; background-color: #01562B; border-bottom-left-radius: 90px; z-index: 11; }
                    
                    .p2-header-text { margin-top: 30px; text-align: center; position: relative; z-index: 20; line-height: 1.5; padding: 0 150px; }
                    .p2-company-name { font-family: 'Noto Serif', serif; font-size: 19px; font-weight: 900; margin: 0; text-transform: uppercase; line-height: 1.4; }
                    .p2-schedule { font-family: 'Inter', sans-serif; color: #b8860b; font-weight: 800; font-size: 16px; margin: 8px 0 0 0; }
                    .p2-personal { font-family: 'Inter', sans-serif; color: #01562B; font-weight: 700; font-size: 15px; margin: 6px 0 0 0; }
                    .p2-header-bar { height: 12px; background: #e5e5e5; width: 92%; margin: 18px auto 25px; }
                    
                    .p2-table { width: 88%; margin: 0 auto; border-collapse: collapse; font-family: 'Inter', sans-serif; }
                    .p2-table td, .p2-table th { border: 2px solid #000; padding: 5px 14px; font-size: 13px; font-weight: 700; color: #000; text-align: left; line-height: 1.2; }
                    .td-label { width: 45%; }
                    .td-value { width: 55%; font-weight: 600; }
                    
                    .p2-sign-container { width: 88%; margin: 60px auto 20px; display: flex; justify-content: space-between; text-align: center; font-family: 'Inter', sans-serif; }
                    .p2-sign-block { width: 30%; }
                    .p2-sign-line { border-top: 2px solid #000; width: 100%; margin: 0 auto 5px; }
                    .p2-sign-label { font-weight: 800; font-size: 13px; color: #000; }
                    
                    .p2-footer { margin-top: auto; display: flex; align-items: center; justify-content: space-between; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; padding: 15px 30px; border-top: 2px solid #e5e5e5; position: absolute; bottom: 0; left: 0; right: 0; }
                    .p2-footer-left { border-left: 15px solid #d4af37; padding-left: 15px; line-height: 1.3; }
                    .p2-footer-mid { display: flex; align-items: center; gap: 8px; border-left: 2px solid #000; padding-left: 20px; }
                    .p2-footer-right { display: flex; align-items: center; gap: 8px; font-size: 14px; }
                </style>
            </head>
            <body>
                <!-- PAGE 1: CERTIFICATE FRONT -->
                <div class="page">
                    <div class="p1-frame">
                        <div class="p1-inner-frame"></div>
                    </div>
                    
                    <div class="green-band"></div>
                    
                    <div class="badge-container">
                        <div class="badge-ribbon ribbon-left"></div>
                        <div class="badge-ribbon ribbon-right"></div>
                        <div class="seal-wrapper">
                            <img src="${logoSealImg}" class="unified-seal" alt="Seal" />
                        </div>
                    </div>
                    
                    <div class="p1-content">
                        <h1 class="p1-title">Ceylon<br>Development<br>Plantation<br>Empire (Pvt) Ltd</h1>
                        
                        <div class="dec-line-container">
                            <div class="dec-line-bar"></div>
                            <div class="dec-line-horiz"></div>
                            <div class="dec-line-bar"></div>
                        </div>
                        <div class="client-schedule-txt">CLIENT SCHEDULE</div>
                        
                        <div class="customer-area">
                            <h2 class="customer-name">${customerInfo.full_name || 'N/A'}</h2>
                            
                            <p class="award-text">
                                This certificate is awarded in recognition of your valuable
                                contribution effort, and commitment which greatly contributed to
                                the Successful executive of this agreement
                            </p>
                        </div>
                    </div>

                    <div class="p1-footer">
                        <p class="address-text">
                            <span style="font-weight: 800; color: #000;">No. 82-B/1. Bauddhaloka Mawatha,</span><br>
                            <span style="font-weight: 500; color: #000;">Colombo 04, Sri Lanka, SRILANKA.</span>
                        </p>
                        
                        <div class="arrow-divider">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                            <div class="arrow-line"></div>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </div>
                        
                        <div class="phone-block">
                            <svg class="phone-icon" width="24" height="24" viewBox="0 0 24 24" fill="black" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> 
                            +94 114 007 007
                        </div>
                    </div>
                </div>
                
                <!-- PAGE 2: CLIENT SCHEDULE -->
                <div class="page">
                    <div class="p2-top-blob-left"></div>
                    <div class="p2-top-blob-right"></div>
                    <div class="p2-top-blob-right-inner"></div>
                    
                    <div class="p2-header-text">
                        <h2 class="p2-company-name">CEYLON DEVELOPMENT PLANTATION EMPIRE (PVT)LTD<br>REG NO:PV00345763</h2>
                        <h3 class="p2-schedule">SCHEDULE (RECIEPT): <span style="color: #000;">${certData.policy_number || businessEntry.policy_number || '...........'}</span></h3>
                        <p class="p2-personal">Personal Details of the Investor.</p>
                    </div>
                    
                    <div class="p2-header-bar"></div>
                    
                    <table class="p2-table" style="margin-bottom: 20px;">
                        <tbody>
                            <tr><td class="td-label">Investor Full Name</td><td class="td-value">${customerInfo.full_name || '_________________________'}</td></tr>
                            <tr><td class="td-label">Name with Initials</td><td class="td-value">${nameWithInitials}</td></tr>
                            <tr><td class="td-label">Address</td><td class="td-value">${address}</td></tr>
                            <tr><td class="td-label">Investor NIC No</td><td class="td-value">${nicNo}</td></tr>
                            <tr><td class="td-label">Name of beneficiary</td><td class="td-value">${beneficiaryName}</td></tr>
                            <tr><td class="td-label">Beneficiary NIC No</td><td class="td-value">${beneficiaryNIC}</td></tr>
                            <tr><td class="td-label">Date of Commencement of the agreement</td><td class="td-value">${commencementDate}</td></tr>
                            <tr><td class="td-label">Date of Termination of the agreement</td><td class="td-value">${terminationDate}</td></tr>
                            <tr><td class="td-label">Contribution Amount</td><td class="td-value">${formatCurrency(invAmount)}</td></tr>
                            <tr>
                                <td class="td-label">Term</td>
                                <td class="td-value">${investmentProduct.name}</td>
                            </tr>
                            <tr><td class="td-label">Mode of Payment</td><td class="td-value">${certData.payment_type?.replace('_', ' ') || businessEntry.payment_method || 'Bank Transfer'}</td></tr>
                            <tr><td class="td-label">Maturity Amount</td><td class="td-value">${formatCurrency(maturity_amount)}</td></tr>
                            
                            <tr><td class="td-label">Security Method</td><td class="td-value">Cheque / Agreement</td></tr>
                        </tbody>
                    </table>
                    
                    <table class="p2-table">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Contribution<br>Amount</th>
                                <th>Monthly Harvest<br>Income</th>
                                <th>Total Monthly Harvest<br>Income (Per annum)</th>
                                <th>Net Guaranteed<br>Harvest</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${breakdownRows}
                            <tr>
                                <td>Total Income</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>${formatCurrency(netGuaranteed)}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div style="width: 88%; margin: 15px auto 10px; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 800; text-transform: uppercase;">
                        _PAYMENT OF THE HARVEST WILL COMMENCE FROM ..............................................................
                    </div>
                    
                    <div class="p2-sign-container">
                        <div class="p2-sign-block">
                            <div class="p2-sign-line"></div>
                            <div class="p2-sign-label">Investor Signature</div>
                        </div>
                        
                        <div class="p2-sign-block">
                            <div class="p2-sign-line"></div>
                            <div class="p2-sign-label">Authorized Signature</div>
                        </div>
                    </div>
                    
                    <div class="p2-footer">
                        <div class="p2-footer-left">
                            No. 82-B/1. Bauddhaloka Mawatha,<br>Colombo 04, Sri Lanka.
                        </div>
                        <div class="p2-footer-mid">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            <div>WWW.CDP.LK<br><span style="color: #666; font-weight: 500;">info@cdp.lk</span></div>
                        </div>
                        <div class="p2-footer-right">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="black" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            +94 114 007 007
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
        console.error("Failed to print certificate:", error);
        const errorMessage = error.response?.data?.message || error.message || "Unable to generate certificate at this time.";
        toast.error(errorMessage);
    }
}

