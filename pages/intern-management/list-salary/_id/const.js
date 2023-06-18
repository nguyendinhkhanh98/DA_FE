export const columns = [
    {
        slots: { title: "no_" },
        scopedSlots: { customRender: 'no' },
        key: "no",
        defaultChecked: true
    },
    {
        slots: { title: "salary_a_day" },
        dataIndex: "salaryaday",
        key: "salaryaday",
        sorter: (a, b) => (a.address > b.address ? 1 : -1),
        scopedSlots: {
            filterDropdown: "filterDropdown",
            filterIcon: "filterIcon",
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
    }
];
