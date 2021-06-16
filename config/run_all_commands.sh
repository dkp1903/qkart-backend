######################################## EDITABLE ###############################################
# ME details
ME_ID="QKART_BACKEND"

# gitlab details
GITLAB_UPLOAD_DESTINATION="GITLAB_CRIO_DO"

# path to root folders - must exist
#INPUT_PROJECT_ROOT_PATH="/home/arun/workspace/crio/"
STUB_GENERATION="/Users/nabhanpv/Desktop/Crio/Platform/solution_and_stub_creator"
INPUT_PROJECT_ROOT_PATH="/Users/nabhanpv/Desktop/Crio/ME_MASTER_SOLUTIONS/me_qkart_backend_master"
RESULTS_ROOT_FOLDER="/Users/nabhanpv/Desktop/Crio/SOLUTIONS_AND_STUBS_RESULTS/me_qkart_backend"
#INPUT_PROJECT_ROOT_PATH="/home/arun/workspace/crio/ME_INTERVIEW_PREP_JAVA/me_interview_prep_java"
#RESULTS_ROOT_FOLDER="/home/arun/workspace/crio/ME_INTERVIEW_PREP_JAVA/solution_and_stubs"
# additional needed files - must exist
MODULE_ORDERING_FILE="${INPUT_PROJECT_ROOT_PATH}/config/module_ordering.txt"
IGNORE_DIRECTORIES_FILE="${INPUT_PROJECT_ROOT_PATH}/config/directories.ignore"
IGNORE_FILETYPES_FILE="${INPUT_PROJECT_ROOT_PATH}/config/filetypes.ignore"

GITLAB_CREDENTIALS="${STUB_GENERATION}/config/gitlab.config"
TESTSUITES_ACTION_SCRIPT="${INPUT_PROJECT_ROOT_PATH}/config/action.sh"


######################################## DO NOT EDIT ###############################################

# folders to generaete - must follow conventions
SOLUTION_GROUP_NAME="ME_${ME_ID}_SOLUTION"
TESTSUITES_GROUP_NAME="ME_${ME_ID}_TESTSUITES"
INTERMEDIATE_STUB_GROUP_NAME="ME_${ME_ID}_INTERMEDIATE_STUBS"
FINAL_STUB_GROUP_NAME="ME_${ME_ID}_STUBS"

# path to log files - will be generated
VALIDATOR_LOG="${RESULTS_ROOT_FOLDER}/logs/validator.log"
SOLUTION_LOG="${RESULTS_ROOT_FOLDER}/logs/solution.log"
TESTSUITES_LOG="${RESULTS_ROOT_FOLDER}/logs/testsuites.log"
INTERMEDIATE_STUBS_LOG="${RESULTS_ROOT_FOLDER}/logs/intermediate_stub.log"
FINAL_STUBS_LOG="${RESULTS_ROOT_FOLDER}/logs/final_stub.log"
GITLAB_LOG="${RESULTS_ROOT_FOLDER}/logs/gitlab.log"

######################################## UTILS ###############################################

# scripts that should be executed - can be cherry-picked
# commands=(
#     "VALIDATOR" "SOLUTION_GENERATOR" "TESTSUITES_GENERATOR" "INTERMEDIATE_STUBS_GENERATOR" "FINAL_STUBS_GENERATOR" "GITLAB_UPLOAD"
# )

commands=(
    #"VALIDATOR" "SOLUTION_GENERATOR" "TESTSUITES_GENERATOR" "INTERMEDIATE_STUBS_GENERATOR" "FINAL_STUBS_GENERATOR" "GITLAB_UPLOAD"
   "VALIDATOR" "SOLUTION_GENERATOR" "INTERMEDIATE_STUBS_GENERATOR" "FINAL_STUBS_GENERATOR" "GITLAB_UPLOAD"
    # "VALIDATOR" "SOLUTION_GENERATOR" "INTERMEDIATE_STUBS_GENERATOR" "FINAL_STUBS_GENERATOR"  
    # "VALIDATOR"
    # "GITLAB_UPLOAD"
 )

######################################## COMMANDS ###############################################

# input: master solution folder
# output: validation messages on console
rm -rf ${RESULTS_ROOT_FOLDER}/*

if [[ " ${commands[@]} " =~ "VALIDATOR" ]]; then
    python3 ${STUB_GENERATION}/src/validator.py \
    --input ${INPUT_PROJECT_ROOT_PATH} \
    --log ${VALIDATOR_LOG} \
    --config ${MODULE_ORDERING_FILE} \
    --ignore_directories ${IGNORE_DIRECTORIES_FILE} \
    --ignore_filetypes ${IGNORE_FILETYPES_FILE}

    echo "\n***************** Validation complete ************************\n"
fi


######################################################################################################

# input: master solution folder
# output: solution group with each sub-folder having the solution for that module

if [[ " ${commands[@]} " =~ "SOLUTION_GENERATOR" ]]; then
    python3 ${STUB_GENERATION}/src/generate_solution.py \
    --input ${INPUT_PROJECT_ROOT_PATH} \
    --log ${SOLUTION_LOG} \
    --config ${MODULE_ORDERING_FILE} \
    --me_id ${ME_ID} \
    --ignore_directories ${IGNORE_DIRECTORIES_FILE} \
    --ignore_filetypes ${IGNORE_FILETYPES_FILE} \
    --output ${RESULTS_ROOT_FOLDER} \
    --group_name ${SOLUTION_GROUP_NAME} \
    #--remove_unused_imports

    ret=$?
    if [ $ret -ne 0 ]
    then
        echo "\n***************** Solution Generation Failed ************************\n"
        exit 1
    else
        echo "\n***************** Solution Generation Succeded ************************\n"
        sleep 1
    fi
fi

######################################################################################################

# input: solution group folder, action script
# output: testsuites group with each sub-folder having the tests for that module

if [[ " ${commands[@]} " =~ "TESTSUITES_GENERATOR" ]]; then
    testsuites_input="${RESULTS_ROOT_FOLDER}/${SOLUTION_GROUP_NAME}"
    testsuites_output="${RESULTS_ROOT_FOLDER}/${TESTSUITES_GROUP_NAME}"

    python3 ${STUB_GENERATION}/src/generate_testsuites.py \
    --action ${TESTSUITES_ACTION_SCRIPT} \
    --input ${testsuites_input} \
    --output ${testsuites_output}

    ret=$?
    if [ $ret -ne 0 ]
    then
        echo "\n***************** Testsuites Generation Failed ************************\n"
        exit 1
    else
        echo "\n***************** Testsuites Generation Succeded ************************\n"
        sleep 1
    fi
fi

######################################################################################################

# input: solution group folder
# output: intermediate stub group with each sub-folder having the intemediate stub for that module

if [[ " ${commands[@]} " =~ "INTERMEDIATE_STUBS_GENERATOR" ]]; then
    intermediate_stub_input="${RESULTS_ROOT_FOLDER}/${SOLUTION_GROUP_NAME}"

    python3 ${STUB_GENERATION}/src/generate_intermediate_stub.py \
    --input ${intermediate_stub_input} \
    --log ${INTERMEDIATE_STUBS_LOG} \
    --config ${MODULE_ORDERING_FILE} \
    --me_id ${ME_ID} \
    --ignore_directories ${IGNORE_DIRECTORIES_FILE} \
    --ignore_filetypes ${IGNORE_FILETYPES_FILE} \
    --output ${RESULTS_ROOT_FOLDER} \
    --group_name ${INTERMEDIATE_STUB_GROUP_NAME} \
    #--remove_unused_imports

    ret=$?
    if [ $ret -ne 0 ]
    then
        echo "\n***************** Intermediate Stub Generation Failed ************************\n"
        exit 1
    else
        echo "\n***************** Intermediate Stub Generation Succeded ************************\n"
        sleep 1
    fi
fi

######################################################################################################

# input: intermediate stub group folder
# output: final stub group with each sub-folder having the final stub for that module

if [[ " ${commands[@]} " =~ "FINAL_STUBS_GENERATOR" ]]; then
    stub_input_folder="${RESULTS_ROOT_FOLDER}/${INTERMEDIATE_STUB_GROUP_NAME}"
    # stub_output_folder="${RESULTS_ROOT_FOLDER}/${FINAL_STUB_GROUP_NAME}/"

    python3 ${STUB_GENERATION}/src/generate_stub.py \
    --input ${stub_input_folder} \
    --log ${FINAL_STUBS_LOG} \
    --config ${MODULE_ORDERING_FILE} \
    --output ${RESULTS_ROOT_FOLDER} \
    --group_name ${FINAL_STUB_GROUP_NAME} \
    --me_id ${ME_ID}

    ret=$?
    if [ $ret -ne 0 ]
    then
        echo "\n***************** Final Stub Generation Failed ************************\n"
        exit 1
    else
        echo "\n***************** Final Stub Generation Succeded ************************\n"
        sleep 1
    fi
fi

######################################################################################################


# input: group folder which have sub-folders for each module
# output:
# - group folder created as a group in gitlab destination
# - module sub-folder created as a repository within the group in gitlab destination
# - updated content of each module pushed as a commit to the respective repository in gitlab destination

echo "\n***************** Remove empty files and directories ************************\n"

cd $INPUT_PROJECT_ROOT_PATH;
find . -empty -type f -delete
find . -empty -type d -delete
git update-index --chmod=+x gradlew
cd -;

if [[ " ${commands[@]} " =~ "GITLAB_UPLOAD" ]]; then
    # upload solution
    solution_path="${RESULTS_ROOT_FOLDER}/${SOLUTION_GROUP_NAME}"

    python3 ${STUB_GENERATION}/src/gitlab_repo.py \
    --config ${GITLAB_CREDENTIALS} \
    --group ${solution_path} \
    --log ${GITLAB_LOG} \
    --remote_source ${GITLAB_UPLOAD_DESTINATION}

    ret=$?
    if [ $ret -ne 0 ]
    then
        echo "\n***************** Gitlab Upload for Solution Failed ************************\n"
        exit 1
    else
        echo "\n***************** Gitlab Upload for Solution Succeded ************************\n"
    fi

    # -------------------------------

    # upload test suites
    testsuites_path="${RESULTS_ROOT_FOLDER}/${TESTSUITES_GROUP_NAME}"

    #python3 src/gitlab_repo.py \
    #--config ${GITLAB_CREDENTIALS} \
    #--group ${testsuites_path} \
    #--log ${GITLAB_LOG} \
    #--remote_source ${GITLAB_UPLOAD_DESTINATION}

    ret=$?
    if [ $ret -ne 0 ]
    then
        echo "\n***************** Gitlab Upload for Test Suites Failed ************************\n"
        exit 1
    else
        echo "\n***************** Gitlab Upload for Test Suites Succeded ************************\n"
    fi

    # -------------------------------

    # upload stubs
    stub_path="${RESULTS_ROOT_FOLDER}/${FINAL_STUB_GROUP_NAME}"

    python3 ${STUB_GENERATION}/src/gitlab_repo.py \
    --config ${GITLAB_CREDENTIALS} \
    --group ${stub_path} \
    --log ${GITLAB_LOG} \
    --remote_source ${GITLAB_UPLOAD_DESTINATION}

    ret=$?
    if [ $ret -ne 0 ]
    then
        echo "\n***************** Gitlab Upload for Stubs Failed ************************\n"
        exit 1
    else
        echo "\n***************** Gitlab Upload for Stubs Succeded ************************\n"
    fi
fi
