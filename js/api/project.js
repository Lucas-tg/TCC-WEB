function insertProject() {
    stompClient.publish({
        destination: `/app/workspace/${$("#projectIdWorkspace").val()}/project.add`,
        body: JSON.stringify({
            'name': $("#projectName").val(),
            'description': $("#projectDescription").val(),
            'idWorkspace': $("#projectIdWorkspace").val(),
            'workspacePosition': $("#projectWorkspacePosition").val()
        })
    });
}

function updateProject(oldWorkspaceId, oldWorkspacePosition) {
    var id = document.getElementById(`projectId_${oldWorkspaceId}_${oldWorkspacePosition}`).value;
    var name = document.getElementById(`projectName_${oldWorkspaceId}_${oldWorkspacePosition}`).value;
    var description = document.getElementById(`projectDescription_${oldWorkspaceId}_${oldWorkspacePosition}`).value;
    var workspaceId = document.getElementById(`projectWorkspaceId_${oldWorkspaceId}_${oldWorkspacePosition}`).value;
    var workspacePosition = document.getElementById(`projectWorkspacePosition_${oldWorkspaceId}_${oldWorkspacePosition}`).value;

    console.log(`Updating project ${id}`);

    stompClient.publish({
        destination: `/app/workspace/${oldWorkspaceId}/${workspaceId}/project.update/${id}`,
        body: JSON.stringify({
            'name': name,
            'description': description,
            'idWorkspace': workspaceId,
            'workspacePosition': workspacePosition
        })
    });
}

function deleteProject(workspaceId, projectWorkspacePosition) {
    var projectId =  $(`#projectId_${workspaceId}_${projectWorkspacePosition}`).val();
    console.log(`Deleting project ${projectId}`);
    stompClient.publish({
        destination: `/app/workspace/${workspaceId}/project.delete/${projectId}`
    });
}

function showProjects(workspaces) {
    if (!Array.isArray(workspaces)) {
        // transform to array
        workspaces = [workspaces];
    }

    workspaces.forEach(workspace => {
        var workspaceId = workspace.id;

        // clear projects
        if (workspace.projects.length === 0) {
            $(`#projectTable_${workspaceId}`).remove();
        } else {
            workspace.projects.sort(function (a, b) {
                return a.workspacePosition - b.workspacePosition;
            });

            if ($(`#projectTable_${workspaceId}`).length <= 0) {
                $("#tables").append(`<table id="projectTable_${workspaceId}" class="table table-striped"><thead id='projectHead_${workspaceId}'><caption>Projects</caption><tr><th>Workspace Id</th><th>Id</th><th>Name</th><th>Description</th><th>Position</th><th>Action</th></tr></thead><tbody id='projectBody_${workspaceId}'></tbody></table>`);

                workspace.projects.forEach(project => {
                    var projectWorkspacePosition = project.workspacePosition;

                    var tableLine = `<td><input id='projectWorkspaceId_${workspaceId}_${projectWorkspacePosition}' value='${workspaceId}'></td>`;
                    tableLine += `<td><input id='projectId_${workspaceId}_${projectWorkspacePosition}' value='${project.id}' readonly></td>`;
                    tableLine += `<td><input id='projectName_${workspaceId}_${projectWorkspacePosition}' value='${project.name}'></td>`;
                    tableLine += `<td><input id='projectDescription_${workspaceId}_${projectWorkspacePosition}' value='${project.description}'></td>`;
                    tableLine += `<td><input id='projectWorkspacePosition_${workspaceId}_${projectWorkspacePosition}' value='${project.workspacePosition}'></td>`;
                    tableLine += `<td><button onclick='updateProject(${workspaceId}, ${projectWorkspacePosition})'>Update</button>`;
                    tableLine += `<button onclick='deleteProject(${workspaceId}, ${projectWorkspacePosition})'>Delete</button></td>`;
                    $(`#projectBody_${workspaceId}`).append(`<tr id="projectLine_${workspaceId}_${projectWorkspacePosition}">${tableLine}</tr>`);
                });

                // console.log($(`#projectBody_${workspaceId}`).html());
            } else {
                workspace.projects.forEach(project => {
                    var projectWorkspacePosition = project.workspacePosition;

                    if ($(`#projectLine_${workspaceId}_${projectWorkspacePosition}`).length > 0) {

                        $(`#projectWorkspaceId_${workspaceId}_${projectWorkspacePosition}`).val(workspaceId);
                        $(`#projectId_${workspaceId}_${projectWorkspacePosition}`).val(project.id);
                        $(`#projectName_${workspaceId}_${projectWorkspacePosition}`).val(project.name);
                        $(`#projectDescription_${workspaceId}_${projectWorkspacePosition}`).val(project.description);
                        $(`#projectWorkspacePosition_${workspaceId}_${projectWorkspacePosition}`).val(project.workspacePosition);

                    } else {

                        var tableLine = `<tr id="projectLine_${workspaceId}_${projectWorkspacePosition}">`;
                        tableLine += `<td><input id='projectWorkspaceId_${workspaceId}_${projectWorkspacePosition}' value='${workspaceId}'></td>`;
                        tableLine +=`<td><input id='projectId_${workspaceId}_${projectWorkspacePosition}' value='${project.id}' readonly></td>`;
                        tableLine +=`<td><input id='projectName_${workspaceId}_${projectWorkspacePosition}' value='${project.name}'></td>`;
                        tableLine +=`<td><input id='projectDescription_${workspaceId}_${projectWorkspacePosition}' value='${project.description}'></td>`;
                        tableLine +=`<td><input id='projectWorkspacePosition_${workspaceId}_${projectWorkspacePosition}' value='${project.workspacePosition}'></td>`;
                        tableLine +=`<td><button onclick='updateProject(${workspaceId}, ${projectWorkspacePosition})'>Update</button>`;
                        tableLine +=`<button onclick='deleteProject(${workspaceId}, ${projectWorkspacePosition})'>Delete</button></td>`;
                        $(`#projectBody_${workspaceId}`).append(`<tr id="projectLine_${workspaceId}_${projectWorkspacePosition}">${tableLine}</tr>`);

                    }
                });

                // remove others
                $(`#projectBody_${workspaceId} tr`).each(function () {
                    var projectWorkspacePosition = this.id.replace(`projectLine_${workspaceId}_`, "");

                    console.log(`Encontrando ${projectWorkspacePosition}`);

                    var matchingProject = workspace.projects.find(project => project.workspacePosition.toString() === projectWorkspacePosition.toString());
                    if (!matchingProject) {
                        console.log(this);
                        $(this).remove();
                    }
                });
            }
        }
    });
}