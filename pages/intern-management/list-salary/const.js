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
        onFilter: (value, record) => console.log(value, record),
        key: "full_name",
        defaultChecked: true
    },
    {
        slots: { title: "salary_a_day" },
        dataIndex: "salaryaday",
        key: "salaryaday",
        sorter: (a, b) => (a.address > b.address ? 1 : -1),
        scopedSlots: {
            customRender: 'salaryaday'
        },
        defaultChecked: true
    },
    {
        slots: { title: "update_at" },
        scopedSlots: {
            customRender: "updateat",
        },
        dataIndex: "updateat",
        key: "updateat",
        defaultChecked: true
    },
    {
        slots: { title: "action" },
        key: "action",
        scopedSlots: {
            customRender: "action",
        },
        align: 'center',
        defaultChecked: true,
        width: 200
    },
];
