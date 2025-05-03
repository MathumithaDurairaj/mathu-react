import React from 'react';
import { Table } from 'antd';
export const DashboradTable = ({ categories, filteredData, loading }) => {
  return (
    <div className="overflow-auto">
      <Table
        columns={[
          {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => a.title.localeCompare(b.title),
          },
          {
            title: 'Category',
            dataIndex: 'category',
            key: 'category'
          },
          {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            sorter: (a, b) => a.price - b.price,
            render: (price) => `$${price.toFixed(2)}`,
          },
          {
            title: 'Rating',
            dataIndex: ['rating', 'rate'],
            key: 'rating',
            sorter: (a, b) => a.rating.rate - b.rating.rate,
            render: (rate) => rate.toFixed(1),
          },
        ]}
        dataSource={filteredData}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        bordered
        scroll={{ x: 'max-content' }}
      />
    </div>
  )
};