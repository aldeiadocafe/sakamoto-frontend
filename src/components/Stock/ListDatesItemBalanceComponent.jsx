import { useEffect, useState } from 'react'
import { Button, Input, Space, Spin, Table, DatePicker } from 'antd'
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';

import Title from 'antd/es/typography/Title';

import { getAllDatesItem } from '../../services/DatesItemBalanceService'
import { getAllUnits } from '../../services/UnitService'

import * as XLSX from 'xlsx-js-style'

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const { RangePicker } = DatePicker;

const ListDatesItemBalanceComponent = () => {

    const [tabela,      setTabela]      = useState(1);
    const [dados,       setDados]       = useState([])
    const [filterDesc,  setFilterDesc]  = useState([])

    const [loading, setLoading] = useState(false);

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 3,
    });

    const handleReset = (clearFilters, confirm) => {
        clearFilters();
        setSearchText({});
        confirm();
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        // Note: The actual data filtering happens internally via the 'onFilter' prop, 
        // but you can manage a state here if needed for other components.
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
        <div style={{ padding: 8 }}>
            <Input
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value.toUpperCase()] : [])}
            onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
            style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
            <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
            >
                Search
            </Button>
            <Button
                onClick={() => handleReset(clearFilters, confirm)}
                size="small"
                style={{ width: 90 }}
            >
                Reset
            </Button>
            </Space>
        </div>
        ),
        filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) => 
        record[dataIndex].toString().toUpperCase().includes(value.toUpperCase()),
    });

    const colunas = [
        {
            dataIndex:  "_id",
            key: 'id',
            sorter: (a, b) => a._id.localeCompare(b._id),
            // Optional: set a default sort order

            //Ocultando coluna
            render: () => null,
            onHeaderCell: () => ({style: { display: 'none'}}),
            onCell: () => ({ style: {display: 'none'}})            
        },        
        {
            dataIndex:  'itCodigo',
            title: 'Item',
            sorter: (a, b) => a.itCodigo.localeCompare(b.itCodigo),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('itCodigo'),
            onFilter: (value, record) => record.itCodigo.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            dataIndex:  'descricao',
            title: 'Descrição',
            filters:filterDesc,
            filterMode: 'tree',
            filterSearch: true,
            sorter: (a, b) => a.descricao.localeCompare(b.descricao),
            defaultSortOrder: 'ascend', 
            onFilter: (value, record) => record.descricao.startsWith(value),
            ellipsis: true,
        },
        {
            dataIndex:  "unidade",
            title:      "Unid",
            sorter: (a, b) => a.unidade.localeCompare(b.unidade),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('unidade'),
            onFilter: (value, record) => record.unidade.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            dataIndex:  "dataValidade",
            title:      "Dt Valid",
            sorter: (a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime(),
            // Optional: set a default sort order
            showSorterTooltip: { target: 'sorter-icon' }, 
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                <RangePicker
                    value={selectedKeys[0] ? selectedKeys[0] : null}
                    onChange={(dates) => setSelectedKeys(dates ? [dates] : [])}
                    style={{ marginBottom: 8, display: 'block' }}
                    format="DD/MM/YYYY"
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => confirm()} // Aplica o filtro
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                    Filtrar
                    </Button>
                    <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                    Limpar
                    </Button>
                </Space>
                </div>
            ),
            filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            onFilter: (value, record) => {
                
                if (!value || value.length < 2) return true;
                const start = dayjs.utc(value[0]);
                const end = dayjs.utc(value[1]);
                const recordDate = dayjs.utc(record.dataValidade);
                return recordDate >= start && recordDate <= end
//                return recordDate.isAfter(start.subtract(1, 'day')) && recordDate.isBefore(end.add(1, 'day'));
            },
            render: (text) => dayjs.utc(text).format('DD/MM/YYYY'),
        },
        {
            dataIndex:  "quantidade",
            title:      "Quantidade",
            align: 'right',
            sorter: (a, b) => a.quantidade - b.quantidade,
            showSorterTooltip: { target: 'sorter-icon' }, 
            render: (value) => formatter.format(value)
        },
    ]
    
    const onChange = (pagination, filters, sorter, extra) => {
//        console.log('params', pagination, filters, sorter, extra);
    };

    const carregarDados = async () => {

 
        setLoading(true);
        setDados([])

        let unit
        //Unidade
        await getAllUnits().then((response) => {
            unit = response.data

        })

        await getAllDatesItem().then((response) => {

            const dadosAux = response.data.map(item => ({
                _id:            item._id,
                idItem:         item.item._id,
                itCodigo:       item.item.itCodigo,
                descricao:      item.item.descricao,
                quantidade:     item.quantidade,                
                unit:           item.item.unit,
                unidade:        (unit.find(unit => unit._id === item.item.unit).unidade),
                dataValidade:   item.dataValidade,
            }))

            setDados(dadosAux);

            //Montar filtro
            const filtro = dadosAux.map((filtro) => ({
                text:   filtro.descricao,
                value:  filtro.descricao
            }))
            setFilterDesc(filtro)


        }).catch((error)=> {
            console.error(error);
        });

        setLoading(false);

    }

    const exportToExcel = () => {

        const headers = ["Item", "Descrição", "Unid", "Data Validade", "Quantidade"];

        const dadosExcel = dados.map(item => ({
            itCodigo:       item.itCodigo,
            descricao:      item.descricao,
            unidade:        item.unidade,
            dataValidade:   dayjs.utc(item.dataValidade).format('DD/MM/YYYY'),
            quantidade:     formatter.format(item.quantidade)
        }))

        // Cria worksheet / Converte os dados (JSON) em worksheet
        const ws = XLSX.utils.json_to_sheet(dadosExcel)

        // Definir Estilos (Header)
        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F81BD" } },
            alignment: { horizontal: "center" },
            border: {
                bottom: { style: "thin", color: { rgb: "000000" } }
            }
        }

        // Aplicar estilo aos cabeçalhos (A1, B1, C1)
/*        
        if (ws['A1']) ws['A1'].s = headerStyle
        if (ws['B1']) ws['B1'].s = headerStyle
        if (ws['C1']) ws['C1'].s = headerStyle;
        if (ws['D1']) ws['D1'].s = headerStyle;
        if (ws['E1']) ws['E1'].s = headerStyle;
*/
        for (let i = 0; i < headers.length; i++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: i})   //r = row, c = col
            if (!ws[cellAddress]) continue
            ws[cellAddress].s = headerStyle // '.s' é onde o estilo é aplicado
        }

        // Para atribuir conteudo utilizar .v
        ws['A1'].v = "Item"
        ws['B1'].v = "Descrição"
        ws['C1'].v = "Unid"
        ws['D1'].v = "Dt Validade"
        ws['E1'].v = "Quantidade"

        // 3. Ajustar largura das colunas
        ws['!cols'] = [
            { wch: 10 }, // Largura da Coluna A
            { wch: 50 }, // Largura da Coluna B
            { wch: 5  }, // Largura da Coluna C
            { wch: 12 }, // Largura da Coluna D
            { wch: 15 }, // Largura da Coluna E
        ]

        // Cria um novo workbook
        const wb = XLSX.utils.book_new()

        // Adiciona a worksheet ao workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Dados')

        // Gera o arquivo binário e força o download
        XLSX.writeFile(wb, 'Data_Validade.xlsx')

        // 5. Gerar arquivo e baixar
//        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });    
//        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//        saveAs(data, 'data_validade.xlsx');

    }
    
    useEffect(() => {
        carregarDados()
    }, [])

    return (

        <div>

            <div style={{ textAlign: 'center' }}>
                <Title level={2}
                    style={{ color: 'var(--primary-color)'}}
                >Consultar Item por Data de Validade</Title>
            </div>

            <Spin
                spinning={loading}
                fullscreen
            />

            <div style={{
                display: 'flex',
                justifyContent: 'flex-end'
                }}
            >

                <Button 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    onClick={exportToExcel}
                >
                    Exportar para Excel
                </Button>                

            </div>

            <Table
                columns={colunas} 
                dataSource={dados} 
                showSorterTooltip={true}
                size={'small'}
                tableLayout="auto"
                onChange={onChange} 
                scroll={{ y: 'calc(80vh - 50px)' }}                
                rowKey={(record) => record._id}
                pagination={{
                    tabela,
                    // The available options for items per page
                    pageSizeOptions: ['5', '10', '20', '30'], 
                    // Display the size changer
                    showSizeChanger: true, 
                    // Set the default page size
            //        defaultPageSize: 5,
                    // Optional: show total items count
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    // Optional: update tabela page state on change
                    onChange: (page) => {
                    setTabela(page);
                    },
                }}        
            />

        </div>
    )        
}

export default ListDatesItemBalanceComponent