export const columns = [
    {
        slots: { title: "no_" },
        scopedSlots: { customRender: 'no' },
        key: "no",
        defaultChecked: true
    },
    {
        slots: { title: "full_name" },
        dataIndex: "full_name",
        sorter: (a, b) => (a.full_name > b.full_name ? 1 : -1),
        scopedSlots: {
            filterDropdown: "filterDropdown",
            filterIcon: "filterIcon",
        },
        key: "full_name",
        defaultChecked: true
    },
    {
        slots: { title: "address" },
        dataIndex: "address",
        key: "address",
        sorter: (a, b) => (a.address > b.address ? 1 : -1),
        scopedSlots: {

        },
        defaultChecked: true
    },
    {
        slots: { title: "phone" },
        dataIndex: "phone",
        key: "phone",
        defaultChecked: true
    },
    {
        slots: { title: "birthday" },
        dataIndex: "birthday",
        key: "birthday",
        sorter: (a, b) => (a.purpose > b.purpose ? 1 : -1),
        defaultChecked: true
    },
    {
        slots: { title: "action" },
        key: "action",
        scopedSlots: {
            customRender: "action",
        },
        align: 'center',
        defaultChecked: true
    },
];
