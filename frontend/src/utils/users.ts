export const getFirstName = (fullname: string | undefined): string => {
    if (!fullname) return 'Cliente';
    const firstName = fullname.split(' ')[0];
    return firstName || '';
}