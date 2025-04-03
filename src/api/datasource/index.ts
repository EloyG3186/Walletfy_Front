// import LocalStorageDS from "@api/impl/ds/LocalStorageDS";
import ApiDS from "@api/impl/ds/ApiDS";

import DataRepoImpl from "@api/impl/repo/DataRepoImpl";

// const LocalStorageImpl = new LocalStorageDS();
const ApiImpl = new ApiDS();
const DataRepo = new DataRepoImpl(ApiImpl);

export default DataRepo;