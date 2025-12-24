import React from 'react'
import WidgetsDropdown from './WidgetsDropdown'

const Widgets = () => {
  return (
    <div className="card mb-4 border-0 shadow-sm">
      <div className="card-header bg-white">Widgets</div>
      <div className="card-body">
        <WidgetsDropdown />
      </div>
    </div>
  )
}

export default Widgets />
            </CCol >
            <CCol xs={6} lg={4} xxl={2}>
              <CWidgetStatsC
                icon={<CIcon icon={cilChartPie} height={36} />}
                value="28%"
                title="Returning Visitors"
                progress={{ color: 'primary', value: 75 }}
              />
            </CCol>
            <CCol xs={6} lg={4} xxl={2}>
              <CWidgetStatsC
                icon={<CIcon icon={cilSpeedometer} height={36} />}
                value="5:34:11"
                title="Avg. Time"
                progress={{ color: 'danger', value: 75 }}
              />
            </CCol>
            <CCol xs={6} lg={4} xxl={2}>
              <CWidgetStatsC
                icon={<CIcon icon={cilSpeech} height={36} />}
                value="972"
                title="Comments"
                progress={{ color: 'info', value: 75 }}
              />
            </CCol>
          </CRow >
        </DocsExample >
  <DocsExample href="components/widgets/#cwidgetstatsc">
    <CRow xs={{ gutter: 4 }}>
      <CCol xs={6} lg={4} xxl={2}>
        <CWidgetStatsC
          color="info"
          icon={<CIcon icon={cilPeople} height={36} />}
          value="87.500"
          title="Visitors"
          inverse
          progress={{ value: 75 }}
        />
      </CCol>
      <CCol xs={6} lg={4} xxl={2}>
        <CWidgetStatsC
          color="success"
          icon={<CIcon icon={cilUserFollow} height={36} />}
          value="385"
          title="New Clients"
          inverse
          progress={{ value: 75 }}
        />
      </CCol>
      <CCol xs={6} lg={4} xxl={2}>
        <CWidgetStatsC
          color="warning"
          icon={<CIcon icon={cilBasket} height={36} />}
          value="1238"
          title="Products sold"
          inverse
          progress={{ value: 75 }}
        />
      </CCol>
      <CCol xs={6} lg={4} xxl={2}>
        <CWidgetStatsC
          color="primary"
          icon={<CIcon icon={cilChartPie} height={36} />}
          value="28%"
          title="Returning Visitors"
          inverse
          progress={{ value: 75 }}
        />
      </CCol>
      <CCol xs={6} lg={4} xxl={2}>
        <CWidgetStatsC
          color="danger"
          icon={<CIcon icon={cilSpeedometer} height={36} />}
          value="5:34:11"
          title="Avg. Time"
          inverse
          progress={{ value: 75 }}
        />
      </CCol>
      <CCol xs={6} lg={4} xxl={2}>
        <CWidgetStatsC
          color="info"
          icon={<CIcon icon={cilSpeech} height={36} />}
          value="972"
          title="Comments"
          inverse
          progress={{ value: 75 }}
        />
      </CCol>
    </CRow>
  </DocsExample>
      </CCardBody >
    </CCard >
  )
}

export default Widgets
