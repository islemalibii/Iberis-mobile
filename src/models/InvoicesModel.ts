export interface invoice {
    id: number;
    clientName: string;
    status: 'Pending' | 'Sent' | 'Overdue' | 'Paid';
    date: string;
    dueDate: string;
    amount: string;
    invoiceNumber: string;
}

export const getStatusClass = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'pending': return 'status status-draft';
        case 'sent': return 'status status-sent';
        case 'overdue': return 'status status-overdue';
        case 'paid': return 'status status-paid';
        default: return 'status status-default';
    }
};


export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};