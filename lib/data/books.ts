import { vendors } from './vendors';

export interface Book {
    id: string;
    title: string;
    author: string;
    isbn: string;
    mrp: number;
    ourPrice: number;
    condition: 'like_new' | 'good' | 'fair' | 'acceptable';
    vendorId: string;
    vendorName: string;
    area: string;
    category: string;
    savings: number;
    vendorEarn: number;
    riEarn: number;
}

export function calcPrices(mrp: number) {
    const ourPrice = Math.round(mrp * 0.5);
    return {
        ourPrice,
        vendorEarn: Math.round(ourPrice * 0.8),
        riEarn: Math.round(ourPrice * 0.2),
        savings: mrp - ourPrice
    };
}

export const books: Book[] = [
    // ENGINEERING
    { id: 'b1', title: 'BS Grewal Higher Engineering Mathematics', author: 'B.S. Grewal', isbn: '9788174091956', mrp: 950, condition: 'good', vendorId: 'v6', vendorName: 'JNTU Book Bazaar', area: 'Kukatpally', category: 'engineering', ...calcPrices(950) },
    { id: 'b2', title: 'CLRS Introduction to Algorithms', author: 'Cormen et al.', isbn: '9780262033848', mrp: 1850, condition: 'good', vendorId: 'v4', vendorName: 'Student Corner Books', area: 'Ameerpet', category: 'engineering', ...calcPrices(1850) },
    { id: 'b3', title: 'Galvin Operating System Concepts', author: 'Abraham Silberschatz', isbn: '9781119800361', mrp: 1150, condition: 'good', vendorId: 'v4', vendorName: 'Student Corner Books', area: 'Ameerpet', category: 'engineering', ...calcPrices(1150) },
    { id: 'b4', title: 'Kreyszig Advanced Engineering Mathematics', author: 'Erwin Kreyszig', isbn: '9788126554232', mrp: 1250, condition: 'like_new', vendorId: 'v6', vendorName: 'JNTU Book Bazaar', area: 'Kukatpally', category: 'engineering', ...calcPrices(1250) },
    { id: 'b5', title: 'Hibbeler Engineering Mechanics', author: 'R.C. Hibbeler', isbn: '9780133918922', mrp: 1380, condition: 'good', vendorId: 'v15', vendorName: 'KL Rao Technical Books', area: 'Ameerpet', category: 'engineering', ...calcPrices(1380) },
    { id: 'b6', title: 'Korth Database System Concepts', author: 'Silberschatz Korth', isbn: '9780078022159', mrp: 1350, condition: 'like_new', vendorId: 'v4', vendorName: 'Student Corner Books', area: 'Ameerpet', category: 'engineering', ...calcPrices(1350) },
    { id: 'b7', title: 'Tanenbaum Computer Networks', author: 'Andrew Tanenbaum', isbn: '9780132126953', mrp: 1200, condition: 'good', vendorId: 'v4', vendorName: 'Student Corner Books', area: 'Ameerpet', category: 'engineering', ...calcPrices(1200) },
    { id: 'b8', title: 'Sedra Smith Microelectronic Circuits', author: 'Sedra & Smith', isbn: '9780199476299', mrp: 1450, condition: 'good', vendorId: 'v6', vendorName: 'JNTU Book Bazaar', area: 'Kukatpally', category: 'engineering', ...calcPrices(1450) },
    { id: 'b9', title: 'Cengel Thermodynamics', author: 'Yunus Cengel', isbn: '9780073398174', mrp: 1550, condition: 'good', vendorId: 'v15', vendorName: 'KL Rao Technical Books', area: 'Ameerpet', category: 'engineering', ...calcPrices(1550) },
    { id: 'b10', title: 'Oppenheim Signals and Systems', author: 'Alan Oppenheim', isbn: '9780138147570', mrp: 1300, condition: 'good', vendorId: 'v6', vendorName: 'JNTU Book Bazaar', area: 'Kukatpally', category: 'engineering', ...calcPrices(1300) },

    // JEE / NEET
    { id: 'b11', title: 'HC Verma Concepts of Physics Part 1', author: 'H.C. Verma', isbn: '9788177091878', mrp: 500, condition: 'good', vendorId: 'v11', vendorName: 'IIT-JEE Book Hub', area: 'SR Nagar', category: 'jee', ...calcPrices(500) },
    { id: 'b12', title: 'HC Verma Concepts of Physics Part 2', author: 'H.C. Verma', isbn: '9788177092080', mrp: 500, condition: 'good', vendorId: 'v11', vendorName: 'IIT-JEE Book Hub', area: 'SR Nagar', category: 'jee', ...calcPrices(500) },
    { id: 'b13', title: 'DC Pandey Mechanics Part 1', author: 'D.C. Pandey', isbn: '9789313191797', mrp: 695, condition: 'good', vendorId: 'v11', vendorName: 'IIT-JEE Book Hub', area: 'SR Nagar', category: 'jee', ...calcPrices(695) },
    { id: 'b14', title: 'MS Chauhan Organic Chemistry', author: 'M.S. Chauhan', isbn: '9789385576607', mrp: 750, condition: 'good', vendorId: 'v11', vendorName: 'IIT-JEE Book Hub', area: 'SR Nagar', category: 'jee', ...calcPrices(750) },

    // MEDICAL MBBS
    { id: 'b15', title: 'Gray\'s Anatomy 42nd Edition', author: 'Henry Gray', isbn: '9780702052309', mrp: 2500, condition: 'good', vendorId: 'v7', vendorName: 'Nizam Medical Books', area: 'Afzalgunj', category: 'medical', ...calcPrices(2500) },
    { id: 'b16', title: 'BD Chaurasia Human Anatomy Vol 1', author: 'B.D. Chaurasia', isbn: '9788123924854', mrp: 850, condition: 'good', vendorId: 'v7', vendorName: 'Nizam Medical Books', area: 'Afzalgunj', category: 'medical', ...calcPrices(850) },
    { id: 'b17', title: 'Guyton Hall Medical Physiology', author: 'Guyton & Hall', isbn: '9780323597128', mrp: 2300, condition: 'good', vendorId: 'v7', vendorName: 'Nizam Medical Books', area: 'Afzalgunj', category: 'medical', ...calcPrices(2300) },
    { id: 'b18', title: 'Robbins Basic Pathology', author: 'Kumar Abbas', isbn: '9780323353175', mrp: 2600, condition: 'like_new', vendorId: 'v3', vendorName: 'Secunderabad Old Books', area: 'Secunderabad', category: 'medical', ...calcPrices(2600) },
    { id: 'b19', title: 'Harrison\'s Principles Internal Medicine', author: 'Kasper et al.', isbn: '9781259644030', mrp: 4500, condition: 'good', vendorId: 'v7', vendorName: 'Nizam Medical Books', area: 'Afzalgunj', category: 'medical', ...calcPrices(4500) },
    { id: 'b20', title: 'KD Tripathi Medical Pharmacology', author: 'K.D. Tripathi', isbn: '9789352704996', mrp: 1550, condition: 'good', vendorId: 'v7', vendorName: 'Nizam Medical Books', area: 'Afzalgunj', category: 'medical', ...calcPrices(1550) },
    { id: 'b21', title: 'Bailey & Love Surgery', author: 'Williams Ronan', isbn: '9781138295773', mrp: 3200, condition: 'good', vendorId: 'v7', vendorName: 'Nizam Medical Books', area: 'Afzalgunj', category: 'medical', ...calcPrices(3200) },

    // UPSC / COMPETITIVE
    { id: 'b22', title: 'Laxmikant Indian Polity', author: 'M. Laxmikant', isbn: '9789353168933', mrp: 950, condition: 'good', vendorId: 'v9', vendorName: 'Gyan Ganga Books', area: 'LB Nagar', category: 'upsc', ...calcPrices(950) },
    { id: 'b23', title: 'Bipin Chandra India\'s Struggle', author: 'Bipin Chandra', isbn: '9780143031345', mrp: 499, condition: 'good', vendorId: 'v9', vendorName: 'Gyan Ganga Books', area: 'LB Nagar', category: 'upsc', ...calcPrices(499) },
    { id: 'b24', title: 'GC Leong Certificate Geography', author: 'G.C. Leong', isbn: '9780195668452', mrp: 660, condition: 'good', vendorId: 'v9', vendorName: 'Gyan Ganga Books', area: 'LB Nagar', category: 'upsc', ...calcPrices(660) },
    { id: 'b25', title: 'RS Aggarwal Quantitative Aptitude', author: 'R.S. Aggarwal', isbn: '9789352535057', mrp: 595, condition: 'good', vendorId: 'v9', vendorName: 'Gyan Ganga Books', area: 'LB Nagar', category: 'upsc', ...calcPrices(595) },
    { id: 'b26', title: 'RS Aggarwal Verbal Reasoning', author: 'R.S. Aggarwal', isbn: '9789352530878', mrp: 595, condition: 'good', vendorId: 'v9', vendorName: 'Gyan Ganga Books', area: 'LB Nagar', category: 'upsc', ...calcPrices(595) },

    // SCHOOL
    { id: 'b27', title: 'RD Sharma Mathematics Class 12', author: 'R.D. Sharma', isbn: '9788190804547', mrp: 680, condition: 'good', vendorId: 'v8', vendorName: 'Saraswathi Book Store', area: 'Dilsukhnagar', category: 'school', ...calcPrices(680) },
    { id: 'b28', title: 'NCERT Physics Class 12 Part 1', author: 'NCERT', isbn: '9788174506160', mrp: 250, condition: 'good', vendorId: 'v8', vendorName: 'Saraswathi Book Store', area: 'Dilsukhnagar', category: 'school', ...calcPrices(250) },
    { id: 'b29', title: 'RS Aggarwal Maths Class 10', author: 'R.S. Aggarwal', isbn: '9789352530892', mrp: 540, condition: 'good', vendorId: 'v8', vendorName: 'Saraswathi Book Store', area: 'Dilsukhnagar', category: 'school', ...calcPrices(540) },
    { id: 'b30', title: 'Lakhmir Singh Physics Class 10', author: 'Lakhmir Singh', isbn: '9789352530977', mrp: 440, condition: 'good', vendorId: 'v8', vendorName: 'Saraswathi Book Store', area: 'Dilsukhnagar', category: 'school', ...calcPrices(440) },

    // SELF-HELP / FICTION
    { id: 'b31', title: 'Atomic Habits', author: 'James Clear', isbn: '9781847941831', mrp: 599, condition: 'good', vendorId: 'v10', vendorName: 'Prasad Book Palace', area: 'Himayatnagar', category: 'selfhelp', ...calcPrices(599) },
    { id: 'b32', title: 'Wings of Fire', author: 'APJ Abdul Kalam', isbn: '8173711461', mrp: 250, condition: 'good', vendorId: 'v10', vendorName: 'Prasad Book Palace', area: 'Himayatnagar', category: 'selfhelp', ...calcPrices(250) },
    { id: 'b33', title: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780062315007', mrp: 350, condition: 'like_new', vendorId: 'v10', vendorName: 'Prasad Book Palace', area: 'Himayatnagar', category: 'fiction', ...calcPrices(350) },
    { id: 'b34', title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', isbn: '9781612680194', mrp: 399, condition: 'good', vendorId: 'v10', vendorName: 'Prasad Book Palace', area: 'Himayatnagar', category: 'selfhelp', ...calcPrices(399) },
    { id: 'b35', title: 'Zero to One', author: 'Peter Thiel', isbn: '9780804139021', mrp: 699, condition: 'like_new', vendorId: 'v13', vendorName: 'MBA Masters Books', area: 'Banjara Hills', category: 'selfhelp', ...calcPrices(699) }
];
