/**
 * Copyright (c) 2013 QGS. All Rights Reserved.
 *
 * This document contains proprietary and confidential information of QGS.
 * It may not be used for any other purposes,  reproduced in whole or in part, nor passed to any organization or person
 * without the specific permission in writing of the Technical Director, QGS.
 *
 * @see http://myqgs.com/terms
 * @see http://myqgs.com/privacy
 *
 * @author QGS
 *
 * <p>
 * Links webservice config
 * </p>
 */
module.exports = {
    'serverName': 'taxilocal2.qgs.vn',
    'host': 'cc.taxilocal2.qgs.vn',
    'port': 80,
    'basicAuth': 'Basic YWRtaW5AbXlxZ3MuY29tOmFkbWlu',
    'admin': '7A122AB27A248AC245A137AB189A0A1AC124A191AB8A6A1AC119A213AB51A8A1AC47A194AB53A6A1AC52A175AB93A4A1AC173A159AB211A2A1AC61A171AB221A3A1AC38A194AB50A6A1AC236A224AB103A9A1AC223A149AB199A1A1AC199A174AB93A4A1AC161A245AB186A11A1AC169A239AB44A11A1AC173A159AB211A2A1AC',
    'password': '118A239AB7A11A1AC96A206AB114A7A1AC45A106AB178A246AC163A107AB189A246AC189A226AB155A9A1AC191A214AB85A8A1AC110A214AB85A8A1AC113A214AB85A8A1AC112A214AB85A8A1AC107A214AB85A8A1AC106A214AB85A8A1AC',
    'BaseWebservice':{
        'getUserAuthenticate'       : '/api/jsonws/QGSConfig-portlet.userauthenticate/fetchByDomain',
        'editInfoMobileDispatcher'  : '/api/jsonws/taxisetting-portlet.driverinfo/updateUserMdispatcher',
        'resetPassword'             : '/Setting-portlet/api/jsonws/merchant/sendPassword',
        'changePasswordUser'        : '/api/jsonws/Setting-portlet.merchant/changePasswordUser',
        'signup'                    : '/api/jsonws/taxisetting-portlet.driverinfo/registerMDispatcher',
        'calculationFare'           : '/api/jsonws/dispatch-portlet.dispatchserverinfo/get-fare-base-onx-miles-fisrt'
    }
}